package org.apache.seatunnel.plugin.datasource.api.jdbc;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.commons.lang3.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractJdbcHoconBuilder {

    protected static final String KEY_URL = "url";
    protected static final String KEY_USER = "user";
    protected static final String KEY_PASSWORD = "password";
    protected static final String KEY_DRIVER = "driver";
    protected static final String KEY_DATABASE = "database";
    protected static final String KEY_WHOLE_SYNC = "wholeSync";
    protected static final String KEY_SCHEMA = "schema";
    protected static final String KEY_TABLE = "table";
    protected static final String KEY_QUERY = "query";
    protected static final String KEY_PARAMS = "params";
    protected static final String KEY_KEY = "key";
    protected static final String KEY_VALUE = "value";
    protected static final String KEY_GENERATE_SINK_SQL = "generate_sink_sql";
    protected static final String KEY_TABLE_PATH = "table_path";
    protected static final String DEFAULT_NULL = null;

    protected abstract String defaultDriver();

    protected String processPassword(String rawPassword) {
        return rawPassword;
    }

    protected String buildTablePath(String database, String schema, String table) {
        if (StringUtils.isBlank(schema)) {
            return String.format("%s.%s", database, table);
        }
        return String.format("%s.%s.%s", database, schema, table);
    }

    protected void putConnCommon(Config conn, Map<String, Object> map) {
        map.put(KEY_URL, getStringSafe(conn, KEY_URL));
        map.put(KEY_USER, getStringSafe(conn, KEY_USER));
        map.put(KEY_DRIVER, getStringSafe(conn, KEY_DRIVER, defaultDriver()));

        String password = getStringSafe(conn, KEY_PASSWORD, "");
        if (StringUtils.isNotBlank(password)) {
            map.put(KEY_PASSWORD, processPassword(password));
        }
    }

    protected void parseParamsArray(Config config, Map<String, Object> map) {
        if (!config.hasPath(KEY_PARAMS)) {
            return;
        }

        List<? extends Config> list = config.getConfigList(KEY_PARAMS);
        for (Config c : list) {
            String key = getStringSafe(c, KEY_KEY);
            String value = getStringSafe(c, KEY_VALUE, "");
            if (StringUtils.isNotBlank(key)) {
                map.put(key, value);
            }
        }
    }

    protected final String getStringSafe(Config config, String path) {
        if (!config.hasPath(path)) {
            throw new RuntimeException("Missing required configuration: " + path);
        }
        return config.getString(path);
    }

    protected final String getStringSafe(Config config, String path, String defaultValue) {
        return config.hasPath(path) ? config.getString(path) : defaultValue;
    }
}

