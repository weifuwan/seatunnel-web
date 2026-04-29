package org.apache.seatunnel.web.core.job.handler.script;

import com.typesafe.config.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class ScriptJobDefinitionParser {

    private static final Pattern FROM_TABLE_PATTERN = Pattern.compile(
            "(?i)\\bfrom\\s+([`\"\\[]?[a-zA-Z0-9_.$-]+[`\"\\]]?)"
    );

    private static final Pattern INTO_TABLE_PATTERN = Pattern.compile(
            "(?i)\\binto\\s+([`\"\\[]?[a-zA-Z0-9_.$-]+[`\"\\]]?)"
    );

    private static final Pattern UPDATE_TABLE_PATTERN = Pattern.compile(
            "(?i)\\bupdate\\s+([`\"\\[]?[a-zA-Z0-9_.$-]+[`\"\\]]?)"
    );

    public Config parseAndValidate(String hoconContent) {
        if (StringUtils.isBlank(hoconContent)) {
            throw new IllegalArgumentException("hoconContent can not be blank");
        }

        try {
            Config config = ConfigFactory.parseString(hoconContent).resolve();
            config.root().render();
            return config;
        } catch (ConfigException e) {
            log.warn("Invalid hocon content", e);
            throw new IllegalArgumentException("invalid hocon content: " + e.getMessage(), e);
        } catch (Exception e) {
            log.warn("Parse hocon content failed", e);
            throw new IllegalArgumentException("parse hocon content failed: " + e.getMessage(), e);
        }
    }

    public JobDefinitionAnalysisResult analyze(String hoconContent) {
        Config config = parseAndValidate(hoconContent);

        List<PluginConfig> sourcePlugins = getPluginConfigs(config, "source");
        List<PluginConfig> sinkPlugins = getPluginConfigs(config, "sink");

        Set<String> sourceTypes = new LinkedHashSet<>();
        Set<String> sinkTypes = new LinkedHashSet<>();
        Set<String> sourceTables = new LinkedHashSet<>();
        Set<String> sinkTables = new LinkedHashSet<>();

        for (PluginConfig plugin : sourcePlugins) {
            sourceTypes.add(resolveDisplayPluginType(plugin.getPluginName(), plugin.getConfig()));
            sourceTables.addAll(extractSourceTables(plugin.getConfig()));
        }

        for (PluginConfig plugin : sinkPlugins) {
            sinkTypes.add(resolveDisplayPluginType(plugin.getPluginName(), plugin.getConfig()));
            sinkTables.addAll(extractSinkTables(plugin.getConfig()));
        }

        return JobDefinitionAnalysisResult.builder()
                .sourceType(joinAsCsv(sourceTypes))
                .sinkType(joinAsCsv(sinkTypes))
                .sourceTable(JSONUtils.toJsonString(new ArrayList<>(sourceTables)))
                .sinkTable(JSONUtils.toJsonString(new ArrayList<>(sinkTables)))
                .build();
    }

    private String resolveDisplayPluginType(String pluginName, Config pluginConfig) {
        if (StringUtils.isBlank(pluginName)) {
            return "UNKNOWN";
        }

        if (!"Jdbc".equalsIgnoreCase(pluginName)) {
            return pluginName;
        }

        String jdbcUrl = safeGetString(pluginConfig, "url");
        DbType dbType = DataSourceUtils.resolveDbTypeByJdbcUrl(jdbcUrl);
        if (dbType != null) {
            return dbType.name();
        }

        return pluginName;
    }

    /**
     * 获取真正的插件配置：
     * <p>
     * 支持下面几种写法：
     * <p>
     * 1. 嵌套对象写法
     * source {
     * Jdbc {
     * query = "select * from t"
     * }
     * }
     * <p>
     * 2. 数组写法
     * source = [
     * {
     * Jdbc {
     * query = "select * from t"
     * }
     * }
     * ]
     * <p>
     * 3. 扁平字段写法
     * source {
     * plugin_name = "Jdbc"
     * query = "select * from t"
     * }
     */
    private List<PluginConfig> getPluginConfigs(Config rootConfig, String path) {
        List<PluginConfig> result = new ArrayList<>();

        if (rootConfig == null || !rootConfig.hasPath(path)) {
            return result;
        }

        // 先兼容 list
        try {
            List<? extends Config> configList = rootConfig.getConfigList(path);
            for (Config item : configList) {
                result.addAll(extractPluginConfigsFromSingleBlock(item));
            }
            if (!result.isEmpty()) {
                return result;
            }
        } catch (Exception ignore) {
            // ignore
        }

        // 再兼容 object
        try {
            Config block = rootConfig.getConfig(path);
            result.addAll(extractPluginConfigsFromSingleBlock(block));
        } catch (Exception ignore) {
            // ignore
        }

        return result;
    }

    /**
     * 从单个 source/sink block 中提取插件节点
     */
    private List<PluginConfig> extractPluginConfigsFromSingleBlock(Config block) {
        List<PluginConfig> result = new ArrayList<>();
        if (block == null) {
            return result;
        }

        // 先尝试扁平字段写法
        String explicitPluginType = resolvePluginType(block);
        if (!"UNKNOWN".equals(explicitPluginType)) {
            result.add(new PluginConfig(explicitPluginType, block));
            return result;
        }

        // 再尝试把一级 key 当成插件名，例如 Jdbc / Console / FakeSource
        Set<Map.Entry<String, ConfigValue>> entries = block.root().entrySet();
        for (Map.Entry<String, ConfigValue> entry : entries) {
            String key = entry.getKey();
            ConfigValue value = entry.getValue();

            if (value != null && value.valueType() == ConfigValueType.OBJECT) {
                try {
                    Config pluginConfig = block.getConfig(key);
                    result.add(new PluginConfig(key, pluginConfig));
                } catch (Exception e) {
                    log.debug("Read nested plugin config failed, key={}", key, e);
                }
            }
        }

        return result;
    }

    private String resolvePluginType(Config config) {
        if (config == null) {
            return "";
        }

        if (config.hasPath("plugin_name")) {
            return safeGetString(config, "plugin_name");
        }
        if (config.hasPath("pluginName")) {
            return safeGetString(config, "pluginName");
        }
        if (config.hasPath("factory")) {
            return safeGetString(config, "factory");
        }
        if (config.hasPath("type")) {
            return safeGetString(config, "type");
        }
        return "UNKNOWN";
    }

    private List<String> extractSourceTables(Config config) {
        Set<String> tables = new LinkedHashSet<>();

        String query = safeGetString(config, "query");
        if (StringUtils.isNotBlank(query)) {
            tables.addAll(extractTablesFromSourceQuery(query));
        }

        String tablePath = safeGetString(config, "table_path");
        if (StringUtils.isNotBlank(tablePath)) {
            tables.add(normalizeTableName(tablePath));
        }

        String table = safeGetString(config, "table");
        if (StringUtils.isNotBlank(table)) {
            tables.add(normalizeTableName(table));
        }

        if (config.hasPath("table_list")) {
            try {
                List<String> tableList = config.getStringList("table_list");
                if (CollectionUtils.isNotEmpty(tableList)) {
                    for (String item : tableList) {
                        if (StringUtils.isNotBlank(item)) {
                            tables.add(normalizeTableName(item));
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Read source table_list failed", e);
            }
        }

        return new ArrayList<>(tables);
    }

    private List<String> extractSinkTables(Config config) {
        Set<String> tables = new LinkedHashSet<>();

        String query = safeGetString(config, "query");
        if (StringUtils.isNotBlank(query)) {
            tables.addAll(extractTablesFromSinkQuery(query));
        }

        String table = safeGetString(config, "table");
        if (StringUtils.isNotBlank(table)) {
            tables.add(normalizeTableName(table));
        }

        String tablePath = safeGetString(config, "table_path");
        if (StringUtils.isNotBlank(tablePath)) {
            tables.add(normalizeTableName(tablePath));
        }

        return new ArrayList<>(tables);
    }

    private List<String> extractTablesFromSourceQuery(String query) {
        Set<String> tables = new LinkedHashSet<>();
        Matcher matcher = FROM_TABLE_PATTERN.matcher(query);
        while (matcher.find()) {
            String table = matcher.group(1);
            if (StringUtils.isNotBlank(table)) {
                tables.add(normalizeTableName(table));
            }
        }
        return new ArrayList<>(tables);
    }

    private List<String> extractTablesFromSinkQuery(String query) {
        Set<String> tables = new LinkedHashSet<>();

        Matcher intoMatcher = INTO_TABLE_PATTERN.matcher(query);
        while (intoMatcher.find()) {
            String table = intoMatcher.group(1);
            if (StringUtils.isNotBlank(table)) {
                tables.add(normalizeTableName(table));
            }
        }

        Matcher updateMatcher = UPDATE_TABLE_PATTERN.matcher(query);
        while (updateMatcher.find()) {
            String table = updateMatcher.group(1);
            if (StringUtils.isNotBlank(table)) {
                tables.add(normalizeTableName(table));
            }
        }

        Matcher fromMatcher = FROM_TABLE_PATTERN.matcher(query);
        while (fromMatcher.find()) {
            String table = fromMatcher.group(1);
            if (StringUtils.isNotBlank(table)) {
                tables.add(normalizeTableName(table));
            }
        }

        return new ArrayList<>(tables);
    }

    private String safeGetString(Config config, String path) {
        try {
            if (config != null && config.hasPath(path)) {
                return StringUtils.trimToEmpty(config.getString(path));
            }
        } catch (Exception e) {
            log.debug("Read config string failed, path={}", path, e);
        }
        return "";
    }

    private String normalizeTableName(String raw) {
        if (raw == null) {
            return "";
        }

        String value = raw.trim();

        if ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("`") && value.endsWith("`"))
                || (value.startsWith("[") && value.endsWith("]"))) {
            value = value.substring(1, value.length() - 1);
        }

        return value.trim();
    }

    private String joinAsCsv(Set<String> values) {
        List<String> cleaned = new ArrayList<>();
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                cleaned.add(value.trim());
            }
        }
        return String.join(",", cleaned);
    }

    private static class PluginConfig {
        private final String pluginName;
        private final Config config;

        public PluginConfig(String pluginName, Config config) {
            this.pluginName = pluginName;
            this.config = config;
        }

        public String getPluginName() {
            return pluginName;
        }

        public Config getConfig() {
            return config;
        }
    }
}