package org.apache.seatunnel.plugin.datasource.api.hocon;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.AbstractJdbcHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigKeys.*;

public abstract class AbstractJdbcBatchBuilder extends AbstractJdbcHoconBuilder
        implements DataSourceHoconBuilder {

    private static final String MULTI_TABLE = "multiTable";

    /**
     * SeaTunnel JDBC source official table-list key.
     */
    private static final String TABLE_LIST = "table_list";

    /**
     * Web side compatibility keys.
     */
    private static final String SOURCE_TABLE_LIST = "source_table_list";
    private static final String SINK_TABLE_LIST = "sink_table_list";

    /**
     * Web side compatibility input.
     * Source official key is table_path, but some UI configs may still pass table.
     */
    private static final String TABLE = "table";
    private static final String TABLE_PATH = "table_path";
    private static final String TARGET_TABLE_NAME = "targetTableName";

    private static final String GENERATE_SINK_SQL = "generate_sink_sql";
    private static final String AUTO_CREATE_TABLE = "autoCreateTable";
    private static final String PRIMARY_KEY = "primaryKey";
    private static final String BATCH_SIZE = "batchSize";

    private static final String DATABASE_NAME_PLACEHOLDER = "${database_name}";
    private static final String SCHEMA_NAME_PLACEHOLDER = "${schema_name}";
    private static final String TABLE_NAME_PLACEHOLDER = "${table_name}";
    private static final String PRIMARY_KEY_PLACEHOLDER = "${primary_key}";

    @Override
    protected String defaultDriver() {
        return "com.mysql.cj.jdbc.Driver";
    }

    @Override
    public Config buildSourceHocon(String connectionParam,
                                   Config config,
                                   JdbcConnectionProvider jdbcConnectionProvider,
                                   HoconBuildStage stage) {
        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(32);

        putConnCommon(conn, map);
        buildSourceReadTarget(config, conn, map, stage);
        appendSourceAdvancedOptions(config, map);
        appendSourceDynamicOptions(config, map);

        return ConfigFactory.parseMap(map);
    }

    @Override
    public Config buildSinkHocon(String connectionParam, Config config) {
        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(32);

        putConnCommon(conn, map);
        buildSinkWriteTarget(config, conn, map);
        appendSinkSaveMode(config, map);
        appendSinkUpsertOptions(config, map);
        appendSinkAdvancedOptions(config, map);
        appendSinkDynamicOptions(config, map);

        return ConfigFactory.parseMap(map);
    }

    /**
     * Source official behavior:
     *
     * 1. query:
     *    Use query directly.
     *
     * 2. table_path:
     *    Use one full table path.
     *
     * 3. table_list:
     *    Use multiple table paths.
     *
     * Compatibility:
     *
     * - Web side may pass table.
     * - Web side may pass source_table_list / table_list as List<String>.
     * - Final source config should output table_path or table_list, not table.
     */
    protected void buildSourceReadTarget(Config config,
                                         Config conn,
                                         Map<String, Object> map,
                                         HoconBuildStage stage) {
        String sql = JdbcConfigReaders.getString(config, SQL, "");
        if (StringUtils.isNotBlank(sql)) {
            map.put(QUERY, handleQueryByStage(sql, stage));
            return;
        }

        String database = JdbcConfigReaders.getString(conn, DATABASE, "");
        String schema = JdbcConfigReaders.getString(conn, SCHEMA, "");

        List<String> sourceTables = resolveSourceTableNames(config);
        boolean multiTable = isMultiTable(config, sourceTables);

        if (multiTable) {
            List<Map<String, Object>> tableList = buildSourceTableList(database, schema, sourceTables);
            if (CollectionUtils.isEmpty(tableList)) {
                throw new IllegalArgumentException("Missing source table_list, table_list can not be empty");
            }

            map.put(TABLE_LIST, tableList);
            return;
        }

        String tablePath = resolveSourceTablePath(config, database, schema, sourceTables);
        if (StringUtils.isBlank(tablePath)) {
            throw new IllegalArgumentException(
                    "Missing source table, one of query/table_path/table/table_list is required");
        }

        map.put(TABLE_PATH, tablePath);
    }

    protected void appendSourceAdvancedOptions(Config config, Map<String, Object> map) {
        Integer fetchSize = JdbcConfigReaders.getInteger(config, "fetchSize", null);
        if (fetchSize != null && fetchSize > 0) {
            map.put("fetch_size", fetchSize);
        }

        Integer splitSize = JdbcConfigReaders.getInteger(config, "splitSize", null);
        if (splitSize != null && splitSize > 0) {
            map.put("split.size", splitSize);
        }
    }

    protected void appendSourceDynamicOptions(Config config, Map<String, Object> map) {
        JdbcConfigReaders.appendConfigObject(config, CONFIG, map);
        JdbcConfigReaders.parseParamsArray(config, map);
        appendExtraParams(config, map);
    }

    /**
     * Sink official behavior:
     *
     * 1. query:
     *    Use custom write SQL.
     *
     * 2. database + table / table:
     *    Generate sink SQL.
     *
     * Multiple-table sink should not output table_list.
     * According to official examples, JDBC sink uses table variables:
     *
     *   database = "${database_name}_test"
     *   table = "${table_name}_test"
     *
     * or:
     *
     *   database = "${schema_name}_test"
     *   table = "${table_name}_test"
     */
    protected void buildSinkWriteTarget(Config config,
                                        Config conn,
                                        Map<String, Object> map) {
        String sql = JdbcConfigReaders.getString(config, SQL, "");
        if (StringUtils.isNotBlank(sql)) {
            map.put(QUERY, sql);
            map.put(GENERATE_SINK_SQL, false);
            return;
        }

        String database = JdbcConfigReaders.getString(config, DATABASE, "");
        String table = JdbcConfigReaders.getString(config, TABLE, "");
        String targetTableName = JdbcConfigReaders.getString(config, TARGET_TABLE_NAME, "");

        List<String> sinkTables = resolveSinkTableNames(config);
        boolean multiTable = isMultiTable(config, sinkTables);

        String finalTable = resolveSinkTable(config, table, targetTableName, sinkTables, multiTable);
        String finalDatabase = resolveSinkDatabase(config, conn, database, multiTable);

        if (StringUtils.isBlank(finalTable)) {
            throw new IllegalArgumentException(
                    "Missing sink target, one of query/targetTableName/table is required");
        }

        if (StringUtils.isNotBlank(finalDatabase)) {
            map.put(DATABASE, finalDatabase);
        }

        map.put(TABLE, finalTable);
        map.put(GENERATE_SINK_SQL, true);
    }

    protected void appendSinkSaveMode(Config config, Map<String, Object> map) {
        boolean autoCreateTable = JdbcConfigReaders.getBoolean(config, AUTO_CREATE_TABLE, false);

        String writeMode = JdbcConfigReaders.getString(config, "writeMode", "append");
        String dataSaveMode;

        switch (writeMode.toLowerCase()) {
            case "overwrite":
                dataSaveMode = "DROP_DATA";
                break;
            case "append":
            case "upsert":
            default:
                dataSaveMode = "APPEND_DATA";
                break;
        }

        String configuredDataSaveMode = JdbcConfigReaders.getString(config, "dataSaveMode", "");
        if (StringUtils.isBlank(configuredDataSaveMode)) {
            configuredDataSaveMode = JdbcConfigReaders.getString(config, "data_save_mode", "");
        }

        map.put("data_save_mode",
                StringUtils.isNotBlank(configuredDataSaveMode)
                        ? configuredDataSaveMode
                        : dataSaveMode);

        String schemaSaveMode = JdbcConfigReaders.getString(config, "schemaSaveMode", "");
        if (StringUtils.isBlank(schemaSaveMode)) {
            schemaSaveMode = JdbcConfigReaders.getString(config, "schema_save_mode", "");
        }

        map.put("schema_save_mode",
                StringUtils.isNotBlank(schemaSaveMode)
                        ? schemaSaveMode
                        : (autoCreateTable
                        ? "CREATE_SCHEMA_WHEN_NOT_EXIST"
                        : "ERROR_WHEN_SCHEMA_NOT_EXIST"));
    }

    protected void appendSinkUpsertOptions(Config config, Map<String, Object> map) {
        String writeMode = JdbcConfigReaders.getString(config, "writeMode", "append");

        Boolean configuredEnableUpsert = readBooleanObject(config, "enableUpsert");
        if (configuredEnableUpsert == null) {
            configuredEnableUpsert = readBooleanObject(config, "enable_upsert");
        }

        List<String> primaryKeys = resolvePrimaryKeys(config);

        /*
         * 官网语义：
         * enable_upsert 是可选参数，默认 true。
         * primary_keys 也是可选参数。
         *
         * 不能因为 enable_upsert=true 就强制要求 primary_keys。
         *
         * 只有当用户明确选择 writeMode=upsert 时，
         * 才要求必须有 primary_keys。
         */
        boolean writeModeIsUpsert = "upsert".equalsIgnoreCase(writeMode);

        if (writeModeIsUpsert && primaryKeys.isEmpty()) {
            throw new IllegalArgumentException("Primary key is required when writeMode is upsert");
        }

        boolean enableUpsert;
        if (configuredEnableUpsert != null) {
            enableUpsert = configuredEnableUpsert;
        } else {
            /*
             * 官网默认 enable_upsert = true。
             */
            enableUpsert = true;
        }

        map.put("enable_upsert", enableUpsert);

        if (!primaryKeys.isEmpty()) {
            map.put("primary_keys", primaryKeys);
        }
    }

    protected void appendSinkAdvancedOptions(Config config, Map<String, Object> map) {
        Integer batchSize = JdbcConfigReaders.getInteger(config, BATCH_SIZE, 1000);
        if (batchSize != null && batchSize > 0) {
            map.put("batch_size", batchSize);
        }

        String fieldIde = JdbcConfigReaders.getString(config, "fieldIde", "");
        if (StringUtils.isBlank(fieldIde)) {
            fieldIde = JdbcConfigReaders.getString(config, "field_ide", "");
        }
        if (StringUtils.isNotBlank(fieldIde)) {
            map.put("field_ide", fieldIde);
        }

        if (config.hasPath("exactlyOnce")) {
            map.put("is_exactly_once", JdbcConfigReaders.getBoolean(config, "exactlyOnce", false));
        }

        if (config.hasPath("is_exactly_once")) {
            map.put("is_exactly_once", JdbcConfigReaders.getBoolean(config, "is_exactly_once", false));
        }
    }

    protected void appendSinkDynamicOptions(Config config, Map<String, Object> map) {
        JdbcConfigReaders.appendConfigObject(config, CONFIG, map);
        JdbcConfigReaders.parseParamsArray(config, map);
        appendExtraParams(config, map);
    }

    protected void appendExtraParams(Config config, Map<String, Object> map) {
        if (config == null || !config.hasPath(EXTRA_PARAMS)) {
            return;
        }

        List<? extends Config> list = config.getConfigList(EXTRA_PARAMS);
        for (Config item : list) {
            String key = JdbcConfigReaders.getString(item, KEY, "");
            if (StringUtils.isBlank(key)) {
                continue;
            }

            Object value = item.hasPath(VALUE) ? item.getValue(VALUE).unwrapped() : "";
            map.put(key.trim(), value);
        }
    }

    protected List<String> parsePrimaryKeys(String primaryKey) {
        List<String> keys = new ArrayList<>();
        if (StringUtils.isBlank(primaryKey)) {
            return keys;
        }

        for (String item : primaryKey.split(",")) {
            if (StringUtils.isNotBlank(item)) {
                keys.add(item.trim());
            }
        }

        return keys;
    }

    protected String handleQueryByStage(String query, HoconBuildStage stage) {
        return query;
    }

    /**
     * Source side table resolving.
     */
    private List<String> resolveSourceTableNames(Config config) {
        List<String> tables = resolveTableNameList(config, SOURCE_TABLE_LIST);
        if (CollectionUtils.isNotEmpty(tables)) {
            return tables;
        }

        tables = resolveTableNameList(config, TABLE_LIST);
        if (CollectionUtils.isNotEmpty(tables)) {
            return tables;
        }

        String tablePath = JdbcConfigReaders.getString(config, TABLE_PATH, "");
        if (StringUtils.isNotBlank(tablePath)) {
            tables.add(tablePath.trim());
            return tables;
        }

        String table = JdbcConfigReaders.getString(config, TABLE, "");
        if (StringUtils.isNotBlank(table)) {
            tables.add(table.trim());
        }

        return tables;
    }

    private String resolveSourceTablePath(
            Config config,
            String database,
            String schema,
            List<String> sourceTables) {

        String tablePath = JdbcConfigReaders.getString(config, TABLE_PATH, "");
        if (StringUtils.isNotBlank(tablePath)) {
            return tablePath.trim();
        }

        String table = JdbcConfigReaders.getString(config, TABLE, "");
        if (StringUtils.isBlank(table)) {
            table = firstTable(sourceTables);
        }

        if (StringUtils.isBlank(table)) {
            return "";
        }

        if (isFullTablePath(table)) {
            return table.trim();
        }

        return buildTablePath(database, schema, table);
    }

    private List<Map<String, Object>> buildSourceTableList(
            String database,
            String schema,
            List<String> sourceTables) {

        List<Map<String, Object>> tableList = new ArrayList<>();

        for (String table : sourceTables) {
            if (StringUtils.isBlank(table)) {
                continue;
            }

            String tablePath = table.trim();
            if (!isFullTablePath(tablePath)) {
                tablePath = buildTablePath(database, schema, tablePath);
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put(TABLE_PATH, tablePath);
            tableList.add(item);
        }

        return tableList;
    }

    /**
     * Sink side table resolving.
     */
    private List<String> resolveSinkTableNames(Config config) {
        List<String> tables = resolveTableNameList(config, SINK_TABLE_LIST);
        if (CollectionUtils.isNotEmpty(tables)) {
            return tables;
        }

        String table = JdbcConfigReaders.getString(config, TABLE, "");
        if (StringUtils.isNotBlank(table)) {
            tables.add(table.trim());
        }

        String targetTableName = JdbcConfigReaders.getString(config, TARGET_TABLE_NAME, "");
        if (StringUtils.isNotBlank(targetTableName) && !tables.contains(targetTableName.trim())) {
            tables.add(targetTableName.trim());
        }

        return tables;
    }

    private String resolveSinkTable(
            Config config,
            String table,
            String targetTableName,
            List<String> sinkTables,
            boolean multiTable) {

        if (multiTable) {
            String tablePattern = JdbcConfigReaders.getString(config, "tablePattern", "");
            if (StringUtils.isNotBlank(tablePattern)) {
                return tablePattern.trim();
            }

            /*
             * 多表同步场景下，JDBC sink table 不能取某一个具体表名。
             *
             * 官网语义是通过变量承接 source table_list 中的表名：
             *
             *   table = "${table_name}"
             *
             * 后续如果支持前缀/后缀，可以由前端或转换层传入：
             *
             *   tablePattern = "${table_name}_test"
             *   tablePattern = "ods_${table_name}"
             */
            return TABLE_NAME_PLACEHOLDER;
        }

        if (StringUtils.isNotBlank(targetTableName)) {
            return targetTableName.trim();
        }

        if (StringUtils.isNotBlank(table)) {
            return table.trim();
        }

        return firstTable(sinkTables);
    }

    private String resolveSinkDatabase(
            Config config,
            Config conn,
            String database,
            boolean multiTable) {

        if (StringUtils.isNotBlank(database)) {
            return database.trim();
        }

        if (multiTable) {
            String databasePattern = JdbcConfigReaders.getString(config, "databasePattern", "");
            if (StringUtils.isNotBlank(databasePattern)) {
                return databasePattern.trim();
            }

            String connDatabase = JdbcConfigReaders.getString(conn, DATABASE, "");
            if (StringUtils.isNotBlank(connDatabase)) {
                return connDatabase.trim();
            }
        }


        String targetDatabase = JdbcConfigReaders.getString(conn, DATABASE, "");
        if (StringUtils.isNotBlank(targetDatabase)) {
            return targetDatabase.trim();
        }

        return "";
    }

    private boolean isMultiTable(Config config, List<String> tables) {
        if (config != null && JdbcConfigReaders.getBoolean(config, MULTI_TABLE, false)) {
            return true;
        }

        return CollectionUtils.isNotEmpty(tables) && tables.size() > 1;
    }

    private List<String> resolveTableNameList(Config config, String path) {
        List<String> result = new ArrayList<>();
        if (config == null || !config.hasPath(path)) {
            return result;
        }

        try {
            List<? extends Config> objectList = config.getConfigList(path);
            for (Config item : objectList) {
                String tablePath = JdbcConfigReaders.getString(item, TABLE_PATH, "");
                if (StringUtils.isNotBlank(tablePath)) {
                    addDistinct(result, tablePath);
                    continue;
                }

                String table = JdbcConfigReaders.getString(item, TABLE, "");
                if (StringUtils.isNotBlank(table)) {
                    addDistinct(result, table);
                }
            }

            if (CollectionUtils.isNotEmpty(result)) {
                return result;
            }
        } catch (Exception ignored) {
            // Maybe it is List<String>, continue below.
        }

        try {
            List<String> values = config.getStringList(path);
            for (String value : values) {
                addDistinct(result, value);
            }
        } catch (Exception ignored) {
            return result;
        }

        return result;
    }

    private List<String> resolvePrimaryKeys(Config config) {
        List<String> primaryKeys = new ArrayList<>();

        try {
            if (config != null && config.hasPath("primary_keys")) {
                List<String> values = config.getStringList("primary_keys");
                for (String value : values) {
                    addDistinct(primaryKeys, value);
                }
            }
        } catch (Exception ignored) {
            // Continue to read primaryKey.
        }

        if (CollectionUtils.isNotEmpty(primaryKeys)) {
            return primaryKeys;
        }

        String primaryKey = JdbcConfigReaders.getString(config, PRIMARY_KEY, "");
        if (StringUtils.isBlank(primaryKey)) {
            primaryKey = JdbcConfigReaders.getString(config, "primary_keys", "");
        }

        if (StringUtils.isBlank(primaryKey)) {
            return primaryKeys;
        }

        if (PRIMARY_KEY_PLACEHOLDER.equals(primaryKey.trim())) {
            primaryKeys.add(PRIMARY_KEY_PLACEHOLDER);
            return primaryKeys;
        }

        primaryKeys.addAll(parsePrimaryKeys(primaryKey));
        return primaryKeys;
    }

    private Boolean readBooleanObject(Config config, String path) {
        if (config == null || !config.hasPath(path)) {
            return null;
        }

        return JdbcConfigReaders.getBoolean(config, path, false);
    }

    private void addDistinct(List<String> target, String value) {
        if (StringUtils.isBlank(value)) {
            return;
        }

        String cleaned = value.trim();
        if (!target.contains(cleaned)) {
            target.add(cleaned);
        }
    }

    private String firstTable(List<String> tables) {
        if (CollectionUtils.isEmpty(tables)) {
            return "";
        }

        for (String table : tables) {
            if (StringUtils.isNotBlank(table)) {
                return table.trim();
            }
        }

        return "";
    }

    /**
     * A lightweight guard:
     *
     * - db.table
     * - schema.table
     * - db.schema.table
     * - ${schema_name}.${table_name}
     */
    private boolean isFullTablePath(String table) {
        if (StringUtils.isBlank(table)) {
            return false;
        }

        return table.contains(".");
    }

    public abstract String pluginName();

    @Override
    public String sourceTemplate() {
        return ""
                + "  Jdbc {\n"
                + "    url = \"jdbc:mysql://127.0.0.1:3306/demo\"\n"
                + "    user = \"root\"\n"
                + "    password = \"******\"\n"
                + "    driver = \"" + defaultDriver() + "\"\n"
                + "    table_path = \"demo.demo_table\"\n"
                + "    fetch_size = 1000\n"
                + "  }\n";
    }

    @Override
    public String sinkTemplate() {
        return ""
                + "  Jdbc {\n"
                + "    url = \"jdbc:mysql://127.0.0.1:3306/demo\"\n"
                + "    user = \"root\"\n"
                + "    password = \"******\"\n"
                + "    driver = \"" + defaultDriver() + "\"\n"
                + "    table = \"sink_table\"\n"
                + "    generate_sink_sql = true\n"
                + "    data_save_mode = \"APPEND_DATA\"\n"
                + "    schema_save_mode = \"CREATE_SCHEMA_WHEN_NOT_EXIST\"\n"
                + "    batch_size = 1000\n"
                + "  }\n";
    }
}