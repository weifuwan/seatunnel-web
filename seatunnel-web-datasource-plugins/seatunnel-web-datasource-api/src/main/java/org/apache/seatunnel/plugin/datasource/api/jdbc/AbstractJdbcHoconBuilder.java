package org.apache.seatunnel.plugin.datasource.api.jdbc;

import com.typesafe.config.Config;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

public abstract class AbstractJdbcHoconBuilder {

    // =========================
    // JDBC connection keys
    // =========================
    protected static final String KEY_URL = "url";
    protected static final String KEY_USER = "user";
    protected static final String KEY_PASSWORD = "password";
    protected static final String KEY_DRIVER = "driver";
    protected static final String KEY_DATABASE = "database";
    protected static final String KEY_SCHEMA = "schema";

    // =========================
    // Common SeaTunnel keys
    // =========================
    protected static final String KEY_TABLE = "table";
    protected static final String KEY_QUERY = "query";
    protected static final String KEY_TABLE_PATH = "table_path";
    protected static final String KEY_GENERATE_SINK_SQL = "generate_sink_sql";

    // =========================
    // Workflow node keys
    // =========================
    protected static final String KEY_PLUGIN_NAME = "pluginName";
    protected static final String KEY_CONNECTOR_TYPE = "connectorType";
    protected static final String KEY_DB_TYPE = "dbType";
    protected static final String KEY_NODE_TYPE = "nodeType";
    protected static final String KEY_TITLE = "title";
    protected static final String KEY_DESCRIPTION = "description";
    protected static final String KEY_META = "meta";
    protected static final String KEY_CONFIG = "config";

    // =========================
    // Source node keys
    // =========================
    protected static final String KEY_SOURCE_DATA_SOURCE_ID = "sourceDataSourceId";
    protected static final String KEY_SOURCE_TABLE = "sourceTable";
    protected static final String KEY_SOURCE_SQL = "sql";
    protected static final String KEY_READ_MODE = "readMode";
    protected static final String KEY_PLUGIN_OUTPUT = "plugin_output";

    // =========================
    // Sink node keys
    // =========================
    protected static final String KEY_SINK_DATA_SOURCE_ID = "sinkDataSourceId";
    protected static final String KEY_SINK_TABLE_NAME = "sinkTableName";
    protected static final String KEY_SINK_SQL = "sinkSql";
    protected static final String KEY_SINK_MODE = "sinkReadMode";
    protected static final String KEY_PLUGIN_INPUT = "plugin_input";
    protected static final String KEY_AUTO_CREATE_TABLE = "autoCreateTable";
    protected static final String KEY_PRIMARY_KEY = "primaryKey";

    // =========================
    // Generic params keys
    // =========================
    protected static final String KEY_PARAMS = "params";
    protected static final String KEY_EXTRA_PARAMS = "extraParams";
    protected static final String KEY_KEY = "key";
    protected static final String KEY_VALUE = "value";

    protected abstract String defaultDriver();

    protected String processPassword(String rawPassword) {
        return rawPassword;
    }

    protected void putConnCommon(Config conn, Map<String, Object> map) {
        map.put(KEY_URL, getStringRequired(conn, KEY_URL));
        map.put(KEY_USER, getStringRequired(conn, KEY_USER));
        map.put(KEY_DRIVER, getString(configForRead(conn), KEY_DRIVER, defaultDriver()));

        String password = getString(conn, KEY_PASSWORD, "");
        if (StringUtils.isNotBlank(password)) {
            map.put(KEY_PASSWORD, processPassword(password));
        }
    }

    protected String buildTablePath(String database, String schema, String table) {
        if (StringUtils.isBlank(table)) {
            throw new IllegalArgumentException("Table must not be blank");
        }

        if (StringUtils.isBlank(database) && StringUtils.isBlank(schema)) {
            return table;
        }
        if (StringUtils.isBlank(schema)) {
            return database + "." + table;
        }
        if (StringUtils.isBlank(database)) {
            return schema + "." + table;
        }
        return database + "." + schema + "." + table;
    }

    protected void parseParamsArray(Config config, Map<String, Object> map) {
        if (config == null || !config.hasPath(KEY_PARAMS)) {
            return;
        }

        List<? extends Config> list = config.getConfigList(KEY_PARAMS);
        for (Config item : list) {
            String key = getString(item, KEY_KEY, "");
            if (StringUtils.isBlank(key)) {
                continue;
            }
            Object value = item.hasPath(KEY_VALUE) ? item.getValue(KEY_VALUE).unwrapped() : "";
            map.put(key.trim(), value);
        }
    }

    protected void appendConfigObject(Config config, String path, Map<String, Object> map) {
        if (config == null || !config.hasPath(path)) {
            return;
        }
        Config subConfig = config.getConfig(path);
        for (Map.Entry<String, com.typesafe.config.ConfigValue> entry : subConfig.entrySet()) {
            map.put(entry.getKey(), entry.getValue().unwrapped());
        }
    }

    protected final boolean hasText(Config config, String path) {
        if (config == null || !config.hasPath(path) || config.getValue(path) == null) {
            return false;
        }
        Object value = config.getValue(path).unwrapped();
        return value != null && StringUtils.isNotBlank(String.valueOf(value));
    }

    protected final String getStringRequired(Config config, String path) {
        if (config == null || !config.hasPath(path)) {
            throw new IllegalArgumentException("Missing required configuration: " + path);
        }
        Object value = config.getValue(path).unwrapped();
        if (value == null) {
            throw new IllegalArgumentException("Configuration value is null: " + path);
        }
        String result = String.valueOf(value).trim();
        if (result.isEmpty()) {
            throw new IllegalArgumentException("Configuration value is blank: " + path);
        }
        return result;
    }

    protected final String getString(Config config, String path, String defaultValue) {
        if (config == null || !config.hasPath(path) || config.getValue(path) == null) {
            return defaultValue;
        }
        Object value = config.getValue(path).unwrapped();
        return value == null ? defaultValue : String.valueOf(value).trim();
    }

    protected final Integer getInteger(Config config, String path, Integer defaultValue) {
        if (config == null || !config.hasPath(path) || config.getValue(path) == null) {
            return defaultValue;
        }

        Object value = config.getValue(path).unwrapped();
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }

        String str = String.valueOf(value).trim();
        if (StringUtils.isBlank(str)) {
            return defaultValue;
        }

        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid integer configuration: " + path + "=" + str, e);
        }
    }

    protected final Long getLong(Config config, String path, Long defaultValue) {
        if (config == null || !config.hasPath(path) || config.getValue(path) == null) {
            return defaultValue;
        }

        Object value = config.getValue(path).unwrapped();
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }

        String str = String.valueOf(value).trim();
        if (StringUtils.isBlank(str)) {
            return defaultValue;
        }

        try {
            return Long.parseLong(str);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid long configuration: " + path + "=" + str, e);
        }
    }

    protected final Boolean getBoolean(Config config, String path, Boolean defaultValue) {
        if (config == null || !config.hasPath(path) || config.getValue(path) == null) {
            return defaultValue;
        }

        Object value = config.getValue(path).unwrapped();
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean) {
            return (Boolean) value;
        }

        String str = String.valueOf(value).trim();
        if (StringUtils.isBlank(str)) {
            return defaultValue;
        }
        if ("true".equalsIgnoreCase(str)) {
            return true;
        }
        if ("false".equalsIgnoreCase(str)) {
            return false;
        }

        throw new IllegalArgumentException("Invalid boolean configuration: " + path + "=" + str);
    }

    private Config configForRead(Config config) {
        return config;
    }
}