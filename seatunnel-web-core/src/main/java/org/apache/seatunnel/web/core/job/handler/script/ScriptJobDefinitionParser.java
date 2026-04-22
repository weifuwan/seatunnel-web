package org.apache.seatunnel.web.core.job.handler.script;


import com.typesafe.config.Config;
import com.typesafe.config.ConfigException;
import com.typesafe.config.ConfigFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
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

    /**
     * 解析并验证 HOCON
     */
    public Config parseAndValidate(String hoconContent) {
        if (StringUtils.isBlank(hoconContent)) {
            throw new IllegalArgumentException("hoconContent can not be blank");
        }

        try {
            Config config = ConfigFactory.parseString(hoconContent).resolve();

            // 强制触发基础解析校验
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

    /**
     * 从 HOCON 中分析 source/sink 类型与表信息
     */
    public JobDefinitionAnalysisResult analyze(String hoconContent) {
        Config config = parseAndValidate(hoconContent);

        List<Config> sourceConfigs = getConfigList(config, "source");
        List<Config> sinkConfigs = getConfigList(config, "sink");

        Set<String> sourceTypes = new LinkedHashSet<>();
        Set<String> sinkTypes = new LinkedHashSet<>();
        Set<String> sourceTables = new LinkedHashSet<>();
        Set<String> sinkTables = new LinkedHashSet<>();

        for (Config sourceConfig : sourceConfigs) {
            sourceTypes.add(resolvePluginType(sourceConfig));
            sourceTables.addAll(extractSourceTables(sourceConfig));
        }

        for (Config sinkConfig : sinkConfigs) {
            sinkTypes.add(resolvePluginType(sinkConfig));
            sinkTables.addAll(extractSinkTables(sinkConfig));
        }

        return JobDefinitionAnalysisResult.builder()
                .sourceType(joinAsCsv(sourceTypes))
                .sinkType(joinAsCsv(sinkTypes))
                .sourceTable(JSONUtils.toJsonString(new ArrayList<>(sourceTables)))
                .sinkTable(JSONUtils.toJsonString(new ArrayList<>(sinkTables)))
                .build();
    }

    /**
     * 获取 config list，兼容数组与单对象两种写法
     */
    private List<Config> getConfigList(Config rootConfig, String path) {
        List<Config> result = new ArrayList<>();

        if (!rootConfig.hasPath(path)) {
            return result;
        }

        try {
            result.addAll(rootConfig.getConfigList(path));
            return result;
        } catch (Exception ignore) {
            // ignore
        }

        try {
            result.add(rootConfig.getConfig(path));
            return result;
        } catch (Exception ignore) {
            // ignore
        }

        return result;
    }

    /**
     * 解析插件类型
     */
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

    /**
     * source 表名抽取：
     * 1. query
     * 2. table_path
     * 3. table_list
     */
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

        if (config.hasPath("table_list")) {
            try {
                List<String> tableList = config.getStringList("table_list");
                if (CollectionUtils.isNotEmpty(tableList)) {
                    for (String table : tableList) {
                        if (StringUtils.isNotBlank(table)) {
                            tables.add(normalizeTableName(table));
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Read source table_list as string list failed", e);
            }
        }

        return new ArrayList<>(tables);
    }

    /**
     * sink 表名抽取：
     * 1. query
     * 2. table
     */
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

        return new ArrayList<>(tables);
    }

    /**
     * source query 里主要抓 from
     */
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

    /**
     * sink query 里主要抓 into / update / from
     * 某些 sink 也可能是 insert-select
     */
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

        // 兜底：有些写法可能还是 from 某张表后再写出
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
                String value = config.getString(path);
                return StringUtils.trimToEmpty(value);
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
}
