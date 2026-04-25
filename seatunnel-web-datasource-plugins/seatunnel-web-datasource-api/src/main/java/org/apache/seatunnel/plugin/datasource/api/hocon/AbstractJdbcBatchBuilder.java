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
import java.util.List;
import java.util.Map;

import static org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigKeys.*;

public abstract class AbstractJdbcBatchBuilder extends AbstractJdbcHoconBuilder
        implements DataSourceHoconBuilder {

    private static final String MULTI_TABLE = "multiTable";
    private static final String TABLE_LIST = "table_list";
    private static final String SOURCE_TABLE_LIST = "source_table_list";
    private static final String SINK_TABLE_LIST = "sink_table_list";

    /**
     * Returns the default JDBC driver class.
     */
    @Override
    protected String defaultDriver() {
        return "com.mysql.cj.jdbc.Driver";
    }

    /**
     * Builds source HOCON from connection and source config.
     */
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

    /**
     * Builds sink HOCON from connection and sink config.
     */
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
     * Resolves the source read target from SQL or table settings.
     *
     * <p>
     * Compatibility:
     * </p>
     *
     * <ul>
     *     <li>Single table: use table directly.</li>
     *     <li>Multi table: if table is blank, fallback to the first item of table_list/source_table_list.</li>
     * </ul>
     *
     * <p>
     * Note:
     * This method still builds a single-table source HOCON.
     * The multiTable flag is only used to preserve context for later expansion.
     * </p>
     */
    protected void buildSourceReadTarget(Config config,
                                         Config conn,
                                         Map<String, Object> map,
                                         HoconBuildStage stage) {
        String readMode = JdbcConfigReaders.getString(config, READ_MODE, "table");
        String sql = JdbcConfigReaders.getString(config, SQL, "");
        String table = JdbcConfigReaders.getString(config, TABLE, "");

        boolean multiTable = isMultiTable(config);
        List<String> tableList = resolveSourceTableList(config);

        if (StringUtils.isBlank(table)) {
            table = firstTable(tableList);
        }

        String database = JdbcConfigReaders.getString(conn, DATABASE, "");
        String schema = JdbcConfigReaders.getString(conn, SCHEMA, "");

        if (StringUtils.isNotBlank(sql)) {
            map.put(QUERY, handleQueryByStage(sql, stage));
            appendMultiTableMetaIfNecessary(map, multiTable, tableList, SOURCE_TABLE_LIST);
            return;
        }

        if (!"table".equalsIgnoreCase(readMode) && StringUtils.isBlank(table)) {
            throw new IllegalArgumentException("Unsupported readMode without table: " + readMode);
        }

        if (StringUtils.isBlank(table)) {
            throw new IllegalArgumentException("Missing source table, table is required when sql is blank");
        }

        map.put(TABLE_PATH, buildTablePath(database, schema, table));

        appendMultiTableMetaIfNecessary(map, multiTable, tableList, SOURCE_TABLE_LIST);
    }

    /**
     * Appends source-side advanced options.
     */
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

    /**
     * Appends dynamic source options from config objects and arrays.
     */
    protected void appendSourceDynamicOptions(Config config, Map<String, Object> map) {
        JdbcConfigReaders.appendConfigObject(config, CONFIG, map);
        JdbcConfigReaders.parseParamsArray(config, map);
        appendExtraParams(config, map);
    }

    /**
     * Resolves the sink write target from SQL or table settings.
     *
     * <p>
     * Compatibility:
     * </p>
     *
     * <ul>
     *     <li>Single table: use targetTableName/table directly.</li>
     *     <li>Multi table: if both are blank, fallback to the first item of table_list/sink_table_list.</li>
     * </ul>
     */
    protected void buildSinkWriteTarget(Config config,
                                        Config conn,
                                        Map<String, Object> map) {
        String sql = JdbcConfigReaders.getString(config, SQL, "");
        String targetTableName = JdbcConfigReaders.getString(config, TARGET_TABLE_NAME, "");
        String table = JdbcConfigReaders.getString(config, TABLE, "");

        boolean multiTable = isMultiTable(config);
        List<String> tableList = resolveSinkTableList(config);

        String database = JdbcConfigReaders.getString(conn, DATABASE, "");
        String schema = JdbcConfigReaders.getString(conn, SCHEMA, "");

        if (StringUtils.isNotBlank(sql)) {
            map.put(QUERY, sql);
            map.put(GENERATE_SINK_SQL, false);
            appendMultiTableMetaIfNecessary(map, multiTable, tableList, SINK_TABLE_LIST);
            return;
        }

        String finalTable = StringUtils.isNotBlank(targetTableName) ? targetTableName : table;

        if (StringUtils.isBlank(finalTable)) {
            finalTable = firstTable(tableList);
        }

        if (StringUtils.isBlank(finalTable)) {
            throw new IllegalArgumentException("Missing sink target, neither sql nor targetTableName/table is provided");
        }

        map.put(TABLE, finalTable);

        if (StringUtils.isNotBlank(database)) {
            map.put(DATABASE, database);
        }

        if (StringUtils.isNotBlank(schema)) {
            map.put(SCHEMA, schema);
        }

        map.put(GENERATE_SINK_SQL, true);

        appendMultiTableMetaIfNecessary(map, multiTable, tableList, SINK_TABLE_LIST);
    }

    /**
     * Appends sink save mode and schema mode.
     */
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

        map.put("data_save_mode", dataSaveMode);

        String schemaSaveMode = JdbcConfigReaders.getString(config, "schemaSaveMode", "");
        map.put("schema_save_mode",
                StringUtils.isNotBlank(schemaSaveMode)
                        ? schemaSaveMode
                        : (autoCreateTable
                        ? "CREATE_SCHEMA_WHEN_NOT_EXIST"
                        : "ERROR_WHEN_SCHEMA_NOT_EXIST"));
    }

    /**
     * Appends sink upsert and primary key settings.
     */
    protected void appendSinkUpsertOptions(Config config, Map<String, Object> map) {
        String writeMode = JdbcConfigReaders.getString(config, "writeMode", "append");
        String primaryKey = JdbcConfigReaders.getString(config, PRIMARY_KEY, "");

        boolean upsert = "upsert".equalsIgnoreCase(writeMode);
        map.put("enable_upsert", upsert);

        if (!upsert) {
            return;
        }

        if (StringUtils.isBlank(primaryKey)) {
            throw new IllegalArgumentException("Primary key is required when writeMode is upsert");
        }

        List<String> primaryKeys = parsePrimaryKeys(primaryKey);
        if (primaryKeys.isEmpty()) {
            throw new IllegalArgumentException("Primary key is required when writeMode is upsert");
        }

        map.put("primary_keys", primaryKeys);
    }

    /**
     * Appends sink-side advanced options.
     */
    protected void appendSinkAdvancedOptions(Config config, Map<String, Object> map) {
        Integer batchSize = JdbcConfigReaders.getInteger(config, BATCH_SIZE, 1000);
        if (batchSize != null && batchSize > 0) {
            map.put("batch_size", batchSize);
        }

        if (config.hasPath("exactlyOnce")) {
            map.put("is_exactly_once", JdbcConfigReaders.getBoolean(config, "exactlyOnce", false));
        }
    }

    /**
     * Appends dynamic sink options from config objects and arrays.
     */
    protected void appendSinkDynamicOptions(Config config, Map<String, Object> map) {
        JdbcConfigReaders.appendConfigObject(config, CONFIG, map);
        JdbcConfigReaders.parseParamsArray(config, map);
        appendExtraParams(config, map);
    }

    /**
     * Appends extra key-value parameters into the output map.
     */
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

    /**
     * Parses comma-separated primary keys into a list.
     */
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

    /**
     * Handles query transformation by build stage.
     */
    protected String handleQueryByStage(String query, HoconBuildStage stage) {
        return query;
    }

    private boolean isMultiTable(Config config) {
        if (config == null) {
            return false;
        }

        boolean explicitMultiTable = JdbcConfigReaders.getBoolean(config, MULTI_TABLE, false);
        if (explicitMultiTable) {
            return true;
        }

        return hasMoreThanOneTable(resolveTableList(config, TABLE_LIST))
                || hasMoreThanOneTable(resolveTableList(config, SOURCE_TABLE_LIST))
                || hasMoreThanOneTable(resolveTableList(config, SINK_TABLE_LIST));
    }

    private List<String> resolveSourceTableList(Config config) {
        List<String> tables = resolveTableList(config, SOURCE_TABLE_LIST);
        if (CollectionUtils.isNotEmpty(tables)) {
            return tables;
        }

        return resolveTableList(config, TABLE_LIST);
    }

    private List<String> resolveSinkTableList(Config config) {
        List<String> tables = resolveTableList(config, SINK_TABLE_LIST);
        if (CollectionUtils.isNotEmpty(tables)) {
            return tables;
        }

        return resolveTableList(config, TABLE_LIST);
    }

    private List<String> resolveTableList(Config config, String path) {
        if (config == null || !config.hasPath(path)) {
            return new ArrayList<>();
        }

        List<String> result = new ArrayList<>();

        try {
            List<String> values = config.getStringList(path);
            for (String value : values) {
                if (StringUtils.isNotBlank(value)) {
                    String table = value.trim();
                    if (!result.contains(table)) {
                        result.add(table);
                    }
                }
            }
        } catch (Exception ignored) {
            return new ArrayList<>();
        }

        return result;
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

    private boolean hasMoreThanOneTable(List<String> tables) {
        return CollectionUtils.isNotEmpty(tables) && tables.size() > 1;
    }

    private void appendMultiTableMetaIfNecessary(
            Map<String, Object> map,
            boolean multiTable,
            List<String> tableList,
            String outputTableListKey) {

        if (!multiTable) {
            return;
        }

        map.put(MULTI_TABLE, true);

        if (CollectionUtils.isNotEmpty(tableList)) {
            map.put(outputTableListKey, tableList);
            map.put(TABLE_LIST, tableList);
        }
    }

    /**
     * Returns the plugin name.
     */
    public abstract String pluginName();

    /**
     * Returns the default source template.
     */
    @Override
    public String sourceTemplate() {
        return ""
                + "  Jdbc {\n"
                + "    url = \"jdbc:mysql://127.0.0.1:3306/demo\"\n"
                + "    user = \"root\"\n"
                + "    password = \"******\"\n"
                + "    driver = \"" + defaultDriver() + "\"\n"
                + "    query = \"select * from demo_table\"\n"
                + "    fetch_size = 1000\n"
                + "  }\n";
    }

    /**
     * Returns the default sink template.
     */
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