package org.apache.seatunnel.plugin.datasource.api.hocon;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigValue;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;
import org.apache.seatunnel.plugin.datasource.api.jdbc.AbstractJdbcHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.plugin.datasource.api.utils.SqlTimeVariableParser;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public abstract class AbstractJdbcBatchBuilder extends AbstractJdbcHoconBuilder
        implements DataSourceHoconBuilder {

    private static final Pattern SQL_VARIABLE_PATTERN =
            Pattern.compile("\\$\\{var:([^}]+)}");

    private static final DateTimeFormatter DATETIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    protected String defaultDriver() {
        return "com.mysql.cj.jdbc.Driver";
    }

    @Override
    public Config buildSourceHocon(String connectionParam, Config config, JdbcConnectionProvider jdbcConnectionProvider, HoconBuildStage stage) {

        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(16);

        putConnCommon(conn, map);

        if (config.hasPath(KEY_WHOLE_SYNC)) {
            buildTableList(config, conn, map);
            map.put("fetch_size", getNumberSafe(config, "fetchSize", 0));
            map.put("split.size", getNumberSafe(config, "splitSize", 8096));
        } else {
            String database = getStringSafe(conn, KEY_DATABASE, "");
            String schema = getStringSafe(conn, KEY_SCHEMA, null);

            if (config.hasPath(KEY_TABLE_PATH)) {
                String table = getStringSafe(config, KEY_TABLE_PATH);
                map.put(KEY_TABLE_PATH, buildTablePath(database, schema, table));
            }

            if (config.hasPath(KEY_QUERY)) {
                String query = config.getString(KEY_QUERY);
                if (StringUtils.isNotBlank(query)) {
                    map.put(KEY_QUERY, handleQueryByStage(query, stage));
                    map.put(KEY_GENERATE_SINK_SQL, false);
                }
            }

            parseParamsArray(config, map);
        }


        return ConfigFactory.parseMap(map);
    }

    protected String handleQueryByStage(String query, HoconBuildStage stage) {
        if (StringUtils.isBlank(query)) {
            return query;
        }
        if (stage == HoconBuildStage.INSTANCE) {
            return resolveSqlVariables(query);
        }
        return query;
    }


    private void buildTableList(Config config, Config conn, Map<String, Object> map) {
        String mode = getStringSafe(config, "mode");
        if ("1".equals(mode) || "4".equals(mode)) {
            if (config.hasPath("table_list")) {
                List<? extends ConfigValue> tableList = config.getList("table_list");
                List<Map<String, Object>> result = new ArrayList<>();

                String database = getStringSafe(conn, KEY_DATABASE, "");
                String schema = getStringSafe(conn, KEY_SCHEMA, DEFAULT_NULL);

                tableList.forEach(item -> {
                    Map<String, Object> tableItem = new HashMap<>();
                    tableItem.put(
                            KEY_TABLE_PATH,
                            buildTablePath(database, schema, (String) item.unwrapped())
                    );
                    tableItem.put("use_regex", false);
                    result.add(tableItem);
                });
                map.put("table_list", result);
            }
        }
    }

    @Override
    public Config buildSinkHocon(String connectionParam, Config config) {

        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(16);

        putConnCommon(conn, map);

        if (config.hasPath(KEY_TABLE)) {
            String database = getStringSafe(conn, KEY_DATABASE, "");
            map.put(KEY_TABLE, config.getString(KEY_TABLE));
            map.put(KEY_DATABASE, database);
            map.put(KEY_GENERATE_SINK_SQL, true);
        }

        if (config.hasPath(KEY_QUERY)) {
            String query = config.getString(KEY_QUERY);
            if (StringUtils.isNotBlank(query)) {
                map.put(KEY_QUERY, resolveSqlVariables(query));
                map.put(KEY_GENERATE_SINK_SQL, false);
            }
        }

        if (config.hasPath(KEY_WHOLE_SYNC)) {
            String database = getStringSafe(conn, KEY_DATABASE, "");
            map.put(KEY_TABLE, "${table_name}");
            map.put(KEY_DATABASE, database);
            map.put(KEY_GENERATE_SINK_SQL, true);

            map.put("batch_size", getNumberSafe(config, "batchSize", 1000));
            map.put("data_save_mode", getStringSafe(config, "dataSaveMode", "APPEND_DATA"));
            map.put("schema_save_mode", getStringSafe(config, "schemaSaveMode", "CREATE_SCHEMA_WHEN_NOT_EXIST"));
            map.put("enable_upsert", getBoolean(config, "enableUpsert", true));
            map.put("field_ide", getStringSafe(config, "fieldIde", ""));

        }

        appendSinkAdvancedOptions(config, map);
        parseParamsArray(config, map);

        return ConfigFactory.parseMap(map);
    }

    protected String resolveSqlVariables(String sql) {
        if (StringUtils.isBlank(sql)) {
            return sql;
        }

        Matcher matcher = SQL_VARIABLE_PATTERN.matcher(sql);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String variableName = matcher.group(1);
            LocalDateTime dateTime = SqlTimeVariableParser.parse(variableName);
            String replacement = formatDateTimeLiteral(dateTime);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }

        matcher.appendTail(sb);
        return sb.toString();
    }


    protected String formatDateTimeLiteral(LocalDateTime dateTime) {
        return "'" + DATETIME_FORMATTER.format(dateTime) + "'";
    }

    private void appendSinkAdvancedOptions(Config config, Map<String, Object> map) {
        if (config.hasPath("dataSaveMode")) {
            String mode = config.getString("dataSaveMode");
            if (StringUtils.isNotBlank(mode)) {
                map.put("data_save_mode", mode);
            }
        }

        if (config.hasPath("exactlyOnce")) {
            map.put("is_exactly_once", config.getBoolean("exactlyOnce"));
        }

        if (config.hasPath("batchSize")) {
            int batchSize = config.getInt("batchSize");
            if (batchSize > 0) {
                map.put("batch_size", batchSize);
            }
        }

        if (config.hasPath("schemaSaveMode")) {
            String schemaSaveMode = config.getString("schemaSaveMode");
            if (StringUtils.isNotBlank(schemaSaveMode)) {
                map.put("schema_save_mode", schemaSaveMode);
            }
        }

        if (config.hasPath("enableUpsert")) {
            String enableUpsert = config.getString("enableUpsert");
            if (StringUtils.isNotBlank(enableUpsert)) {
                map.put("enable_upsert", enableUpsert);
            }
        }

        if (config.hasPath("extraParams")) {
            Config extraConfig = config.getConfig("extraParams");
            for (Map.Entry<String, ConfigValue> entry : extraConfig.entrySet()) {
                map.put(entry.getKey(), entry.getValue().unwrapped());
            }
        }
    }

    public abstract String pluginName();
}