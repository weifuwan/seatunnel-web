package org.apache.seatunnel.plugin.datasource.api.hocon;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.AbstractJdbcHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractJdbcBatchBuilder extends AbstractJdbcHoconBuilder
        implements DataSourceHoconBuilder {

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
        buildSourceTarget(config, conn, map, stage);
        appendSourceAdvancedOptions(config, map);
        appendSourceDynamicParams(config, map);

        return ConfigFactory.parseMap(map);
    }

    @Override
    public Config buildSinkHocon(String connectionParam, Config config) {
        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(32);

        putConnCommon(conn, map);
        buildSinkTarget(config, conn, map);
        buildSinkSaveMode(config, map);
        buildSinkUpsert(config, map);
        appendSinkAdvancedOptions(config, map);
        appendSinkDynamicParams(config, map);

        return ConfigFactory.parseMap(map);
    }

    protected void buildSourceTarget(Config config,
                                     Config conn,
                                     Map<String, Object> map,
                                     HoconBuildStage stage) {
        String readMode = getString(config, KEY_READ_MODE, "table");
        String sql = getString(config, KEY_SOURCE_SQL, "");
        String sourceTable = getString(config, KEY_SOURCE_TABLE, "");

        String database = getString(conn, KEY_DATABASE, "");
        String schema = getString(conn, KEY_SCHEMA, "");

        if (StringUtils.isNotBlank(sql)) {
            map.put(KEY_QUERY, handleQueryByStage(sql, stage));
            return;
        }

        if (!"table".equalsIgnoreCase(readMode) && StringUtils.isBlank(sourceTable)) {
            throw new IllegalArgumentException("Unsupported readMode without sourceTable: " + readMode);
        }

        if (StringUtils.isBlank(sourceTable)) {
            throw new IllegalArgumentException("Missing source table, sourceTable is required when sql is blank");
        }
        map.put(KEY_TABLE_PATH, database);
        map.put(KEY_DATABASE, buildTablePath(database, schema, sourceTable));
    }

    protected void appendSourceAdvancedOptions(Config config, Map<String, Object> map) {
        Integer fetchSize = getInteger(config, "fetchSize", null);
        if (fetchSize != null && fetchSize > 0) {
            map.put("fetch_size", fetchSize);
        }

        Integer splitSize = getInteger(config, "splitSize", null);
        if (splitSize != null && splitSize > 0) {
            map.put("split.size", splitSize);
        }
    }

    protected void appendSourceDynamicParams(Config config, Map<String, Object> map) {
        appendConfigObject(config, KEY_CONFIG, map);
        parseParamsArray(config, map);
        appendExtraParams(config, map);
    }

    protected void buildSinkTarget(Config config, Config conn, Map<String, Object> map) {
        String sinkSql = getString(config, KEY_SINK_SQL, "");
        String sinkTableName = getString(config, KEY_SINK_TABLE_NAME, "");

        String database = getString(conn, KEY_DATABASE, "");
        String schema = getString(conn, KEY_SCHEMA, "");

        if (StringUtils.isNotBlank(sinkSql)) {
            map.put(KEY_QUERY, sinkSql);
            map.put(KEY_GENERATE_SINK_SQL, false);
            return;
        }

        if (StringUtils.isBlank(sinkTableName)) {
            throw new IllegalArgumentException("Missing sink target, neither sinkSql nor sinkTableName is provided");
        }

        map.put(KEY_TABLE, sinkTableName);
        if (StringUtils.isNotBlank(database)) {
            map.put(KEY_DATABASE, database);
        }
        if (StringUtils.isNotBlank(schema)) {
            map.put(KEY_SCHEMA, schema);
        }
        map.put(KEY_GENERATE_SINK_SQL, true);
    }

    protected void buildSinkSaveMode(Config config, Map<String, Object> map) {
        boolean autoCreateTable = getBoolean(config, KEY_AUTO_CREATE_TABLE, false);

        String dataSaveMode = getString(config, "dataSaveMode", "");
        if (StringUtils.isNotBlank(dataSaveMode)) {
            map.put("data_save_mode", dataSaveMode);
        } else {
            map.put("data_save_mode", "APPEND_DATA");
        }

        String schemaSaveMode = getString(config, "schemaSaveMode", "");
        if (StringUtils.isNotBlank(schemaSaveMode)) {
            map.put("schema_save_mode", schemaSaveMode);
        } else {
            map.put("schema_save_mode",
                    autoCreateTable ? "CREATE_SCHEMA_WHEN_NOT_EXIST" : "ERROR_WHEN_SCHEMA_NOT_EXIST");
        }
    }

    protected void buildSinkUpsert(Config config, Map<String, Object> map) {
        String primaryKey = getString(config, KEY_PRIMARY_KEY, "");

        if (config.hasPath("enableUpsert")) {
            map.put("enable_upsert", config.getValue("enableUpsert").unwrapped());
        } else {
            map.put("enable_upsert", StringUtils.isNotBlank(primaryKey));
        }

        if (StringUtils.isNotBlank(primaryKey)) {
            List<String> primaryKeys = parsePrimaryKeys(primaryKey);
            if (!primaryKeys.isEmpty()) {
                map.put("primary_keys", primaryKeys);
                map.put("field_ide", String.join(",", primaryKeys));
            }
        }
    }

    protected void appendSinkAdvancedOptions(Config config, Map<String, Object> map) {
        Integer batchSize = getInteger(config, "batchSize", 1000);
        if (batchSize != null && batchSize > 0) {
            map.put("batch_size", batchSize);
        }

        if (config.hasPath("exactlyOnce")) {
            map.put("is_exactly_once", getBoolean(config, "exactlyOnce", false));
        }
    }

    protected void appendSinkDynamicParams(Config config, Map<String, Object> map) {
        appendConfigObject(config, KEY_CONFIG, map);
        parseParamsArray(config, map);
        appendExtraParams(config, map);
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

    protected void appendExtraParams(Config config, Map<String, Object> map) {
        if (config == null || !config.hasPath(KEY_EXTRA_PARAMS)) {
            return;
        }

        List<? extends Config> list = config.getConfigList(KEY_EXTRA_PARAMS);
        for (Config item : list) {
            String key = getString(item, KEY_KEY, "");
            if (StringUtils.isBlank(key)) {
                continue;
            }
            Object value = item.hasPath(KEY_VALUE) ? item.getValue(KEY_VALUE).unwrapped() : "";
            map.put(key.trim(), value);
        }
    }

    protected String handleQueryByStage(String query, HoconBuildStage stage) {
        if (StringUtils.isBlank(query)) {
            return query;
        }
        return query;
    }

    public abstract String pluginName();
}