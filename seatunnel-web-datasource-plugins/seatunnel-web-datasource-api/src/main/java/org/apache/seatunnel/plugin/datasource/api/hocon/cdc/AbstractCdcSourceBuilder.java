package org.apache.seatunnel.plugin.datasource.api.hocon.cdc;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.hocon.HoconBuildContext;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractCdcSourceBuilder implements DataSourceHoconBuilder {

    protected static final String HOSTNAME = "hostname";
    protected static final String PORT = "port";
    protected static final String USERNAME = "username";
    protected static final String PASSWORD = "password";
    protected static final String URL = "url";

    protected static final String DATABASE_NAMES = "database-names";
    protected static final String TABLE_NAMES = "table-names";
    protected static final String TABLE_PATTERN = "table-pattern";
    protected static final String SERVER_ID = "server-id";
    protected static final String SERVER_TIME_ZONE = "server-time-zone";
    protected static final String STARTUP_MODE = "startup.mode";
    protected static final String STOP_MODE = "stop.mode";
    protected static final String TABLE_NAMES_CONFIG = "table-names-config";

    /**
     * Frontend / node config field.
     */
    protected static final String DATABASE = "database";
    protected static final String TABLE = "table";
    protected static final String TABLE_NAMES_NODE = "tableNames";

    @Override
    public boolean supportsSink() {
        return false;
    }

    @Override
    public Config buildSourceHocon(HoconBuildContext context) {
        Config conn = context.getConnectionConfig();
        Config node = context.getNodeConfig();

        Map<String, Object> map = new HashMap<>(32);

        appendConnectionOptions(conn, node, map);
        appendCaptureOptions(conn, node, map);
        appendStartupOptions(node, map);
        appendAdvancedOptions(node, map);
        appendPluginRelation(node, map);
        appendExtraParams(node, map);

        return ConfigFactory.parseMap(map);
    }

    @Override
    public Config buildSinkHocon(HoconBuildContext context) {
        throw new UnsupportedOperationException(pluginName() + " does not support sink side");
    }

    protected void appendConnectionOptions(Config conn, Config node, Map<String, Object> map) {
        /*
         * 优先从 datasource connectionParam 取连接信息。
         */
        putIfPresent(conn, URL, map);
        putAliasIfPresent(conn, "user", USERNAME, map);
        putIfPresent(conn, USERNAME, map);
        putIfPresent(conn, PASSWORD, map);
        putIfPresent(conn, HOSTNAME, map);
        putIfPresent(conn, PORT, map);

        /*
         * 兼容你的 datasource 字段：
         * host -> hostname
         */
        putAliasIfPresent(conn, "host", HOSTNAME, map);

        /*
         * node 允许覆盖 connectionParam。
         */
        putIfPresent(node, URL, map);
        putIfPresent(node, USERNAME, map);
        putIfPresent(node, PASSWORD, map);
        putIfPresent(node, HOSTNAME, map);
        putIfPresent(node, PORT, map);
        putAliasIfPresent(node, "host", HOSTNAME, map);
    }

    protected void appendCaptureOptions(Config conn, Config node, Map<String, Object> map) {
        appendDatabaseNames(conn, node, map);
        appendTableNames(conn, node, map);

        putIfPresent(node, TABLE_PATTERN, map);
        putIfPresent(node, SERVER_ID, map);
        putIfPresent(node, SERVER_TIME_ZONE, map);

        if (node != null && node.hasPath(TABLE_NAMES_CONFIG)) {
            map.put(TABLE_NAMES_CONFIG, node.getValue(TABLE_NAMES_CONFIG).unwrapped());
        }
    }

    protected void appendDatabaseNames(Config conn, Config node, Map<String, Object> map) {
        /*
         * 如果 node 已经传了 SeaTunnel CDC 原生字段 database-names，
         * 说明是高级/手动配置场景，直接尊重 node 配置。
         */
        if (node != null && node.hasPath(DATABASE_NAMES)) {
            putListIfPresent(node, DATABASE_NAMES, map);
            return;
        }

        /*
         * 常规场景：从 datasource connectionParam.database 推导。
         */
        String database = getString(conn, DATABASE);
        if (StringUtils.isNotBlank(database)) {
            map.put(DATABASE_NAMES, Collections.singletonList(database));
        }
    }

    protected void appendTableNames(Config conn, Config node, Map<String, Object> map) {
        /*
         * 如果 node 已经传了 SeaTunnel CDC 原生字段 table-names，
         * 说明已经是 db.table 格式，直接使用。
         */
        if (node != null && node.hasPath(TABLE_NAMES)) {
            putListIfPresent(node, TABLE_NAMES, map);
            return;
        }

        String database = getString(conn, DATABASE);

        /*
         * 前端当前字段：
         * tableNames = ["t_cockpit_code_detail"]
         *
         * SeaTunnel CDC 需要：
         * table-names = ["cockpit.t_cockpit_code_detail"]
         */
        if (node != null && node.hasPath(TABLE_NAMES_NODE)) {
            List<String> tables = node.getStringList(TABLE_NAMES_NODE);
            List<String> fullTableNames = buildFullTableNames(database, tables);
            if (!fullTableNames.isEmpty()) {
                map.put(TABLE_NAMES, fullTableNames);
            }
            return;
        }

        /*
         * 兼容单表字段：
         * table = "t_cockpit_code_detail"
         */
        String table = getString(node, TABLE);
        if (StringUtils.isNotBlank(table)) {
            map.put(TABLE_NAMES, Collections.singletonList(buildFullTableName(database, table)));
        }
    }

    protected List<String> buildFullTableNames(String database, List<String> tables) {
        List<String> result = new ArrayList<>();

        if (tables == null || tables.isEmpty()) {
            return result;
        }

        for (String table : tables) {
            if (StringUtils.isBlank(table)) {
                continue;
            }

            result.add(buildFullTableName(database, table));
        }

        return result;
    }

    protected String buildFullTableName(String database, String table) {
        String trimmedTable = table.trim();

        /*
         * 如果前端已经传了 cockpit.t_xxx，
         * 避免拼成 cockpit.cockpit.t_xxx。
         */
        if (trimmedTable.contains(".")) {
            return trimmedTable;
        }

        if (StringUtils.isBlank(database)) {
            return trimmedTable;
        }

        return database.trim() + "." + trimmedTable;
    }

    protected void appendStartupOptions(Config node, Map<String, Object> map) {
        putIfPresent(node, STARTUP_MODE, map);
        putIfPresent(node, STOP_MODE, map);

        putIfPresent(node, "startup.specific-offset.file", map);
        putIfPresent(node, "startup.specific-offset.pos", map);
        putIfPresent(node, "startup.timestamp", map);

        putIfPresent(node, "stop.specific-offset.file", map);
        putIfPresent(node, "stop.specific-offset.pos", map);
    }

    protected void appendAdvancedOptions(Config node, Map<String, Object> map) {
        putIfPresent(node, "connect.timeout.ms", map);
        putIfPresent(node, "connect.max-retries", map);
        putIfPresent(node, "connection.pool.size", map);
        putIfPresent(node, "chunk-key.even-distribution.factor.lower-bound", map);
        putIfPresent(node, "chunk-key.even-distribution.factor.upper-bound", map);
        putIfPresent(node, "sample-sharding.threshold", map);
        putIfPresent(node, "inverse-sampling.rate", map);
        putIfPresent(node, "schema-changes.enabled", map);
        putIfPresent(node, "int_type_narrowing", map);
        putIfPresent(node, "exactly_once", map);
    }

    protected void appendPluginRelation(Config node, Map<String, Object> map) {
        putIfPresent(node, "plugin_input", map);
        putIfPresent(node, "plugin_output", map);
    }

    protected void appendExtraParams(Config node, Map<String, Object> map) {
        if (node == null || !node.hasPath("extraParams")) {
            return;
        }

        List<? extends Config> list = node.getConfigList("extraParams");
        for (Config item : list) {
            String key = JdbcConfigReaders.getString(item, "key", "");
            if (StringUtils.isBlank(key)) {
                continue;
            }

            Object value = item.hasPath("value")
                    ? item.getValue("value").unwrapped()
                    : "";

            map.put(key.trim(), value);
        }
    }

    protected void putIfPresent(Config config, String key, Map<String, Object> map) {
        if (config == null || !config.hasPath(key)) {
            return;
        }

        Object value = config.getValue(key).unwrapped();
        if (value instanceof String && StringUtils.isBlank((String) value)) {
            return;
        }

        map.put(key, value);
    }

    protected void putAliasIfPresent(Config config,
                                     String sourceKey,
                                     String targetKey,
                                     Map<String, Object> map) {
        if (config == null || !config.hasPath(sourceKey)) {
            return;
        }

        Object value = config.getValue(sourceKey).unwrapped();
        if (value instanceof String && StringUtils.isBlank((String) value)) {
            return;
        }

        map.put(targetKey, value);
    }

    protected void putListIfPresent(Config config, String key, Map<String, Object> map) {
        if (config == null || !config.hasPath(key)) {
            return;
        }

        map.put(key, config.getValue(key).unwrapped());
    }

    protected String getString(Config config, String key) {
        if (config == null || !config.hasPath(key)) {
            return null;
        }

        String value = config.getString(key);
        return StringUtils.isBlank(value) ? null : value.trim();
    }
}