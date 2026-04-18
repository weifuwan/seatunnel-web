package org.apache.seatunnel.plugin.datasource.api.jdbc;

public final class JdbcConfigKeys {

    private JdbcConfigKeys() {
    }

    // =========================
    // JDBC connection keys
    // =========================
    public static final String URL = "url";
    public static final String USER = "user";
    public static final String PASSWORD = "password";
    public static final String DRIVER = "driver";
    public static final String DATABASE = "database";
    public static final String SCHEMA = "schema";

    // =========================
    // Common SeaTunnel keys
    // =========================
    public static final String TABLE = "table";
    public static final String QUERY = "query";
    public static final String TABLE_PATH = "table_path";
    public static final String GENERATE_SINK_SQL = "generate_sink_sql";

    // =========================
    // Workflow node base keys
    // =========================
    public static final String PLUGIN_NAME = "pluginName";
    public static final String CONNECTOR_TYPE = "connectorType";
    public static final String DB_TYPE = "dbType";
    public static final String NODE_TYPE = "nodeType";
    public static final String TITLE = "title";
    public static final String DESCRIPTION = "description";
    public static final String META = "meta";
    public static final String CONFIG = "config";

    // =========================
    // Unified workflow config keys
    // =========================
    public static final String DATA_SOURCE_ID = "dataSourceId";
    public static final String READ_MODE = "readMode";
    public static final String TARGET_MODE = "targetMode";
    public static final String SQL = "sql";
    public static final String AUTO_CREATE_TABLE = "autoCreateTable";
    public static final String TARGET_TABLE_NAME = "targetTableName";
    public static final String PRIMARY_KEY = "primaryKey";
    public static final String WRITE_MODE = "writeMode";
    public static final String BATCH_SIZE = "batchSize";
    public static final String PLUGIN_INPUT = "pluginInput";
    public static final String PLUGIN_OUTPUT = "pluginOutput";
    public static final String EXTRA_PARAMS = "extraParams";

    // =========================
    // Generic params keys
    // =========================
    public static final String PARAMS = "params";
    public static final String KEY = "key";
    public static final String VALUE = "value";
}