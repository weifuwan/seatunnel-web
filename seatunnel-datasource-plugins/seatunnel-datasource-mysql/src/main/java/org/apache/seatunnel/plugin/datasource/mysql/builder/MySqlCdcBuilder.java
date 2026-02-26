package org.apache.seatunnel.plugin.datasource.mysql.builder;

import com.alibaba.fastjson.JSON;
import com.google.auto.service.AutoService;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigValue;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.enums.SyncMode;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.plugin.datasource.api.jdbc.ServerIdManager;
import org.apache.seatunnel.plugin.datasource.mysql.param.MySQLConnectionParam;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@AutoService(DataSourceHoconBuilder.class)
@Slf4j
public class MySqlCdcBuilder implements DataSourceHoconBuilder {

    @Override
    public Config buildSourceHocon(String connectionParam,
                                   Config config,
                                   JdbcConnectionProvider provider) {

        MySQLConnectionParam param =
                JSON.parseObject(connectionParam, MySQLConnectionParam.class);

        Map<String, Object> map = new HashMap<>();

        fillServerId(map, config, provider, param);
        fillBasicInfo(map, param);
        fillSyncMode(map, config, param);
        fillStartupMode(map, config);
        fillStopMode(map, config);
        fillSchemaChange(map, config);
        fillExtraParams(map, config);

        return ConfigFactory.parseMap(map);
    }


    @Override
    public Config buildSinkHocon(String connectionParam, Config config) {
        throw new UnsupportedOperationException("MySQL CDC does not support sink");
    }

    @Override
    public String pluginName() {
        return "MySQL-CDC";
    }

    /**
     * Allocate and fill MySQL server-id configuration.
     *
     * If jobId is not provided in config, a default server-id will be used.
     * Otherwise:
     * 1. Allocate a server-id range based on jobId and parallelism
     * 2. Store the allocated range in "server-id"
     *
     * @param map       Target configuration map
     * @param config    Job-level configuration
     * @param provider  JDBC connection provider
     * @param param     MySQL connection parameters
     */
    private void fillServerId(Map<String, Object> map,
                              Config config,
                              JdbcConnectionProvider provider,
                              MySQLConnectionParam param) {

        if (!config.hasPath("jobId")) {
            map.put("server-id", "9527");
            return;
        }

        String jobId = config.getString("jobId");
        int parallelism = config.getInt("parallelism");

        try {
            ServerIdManager manager = new ServerIdManager(provider, param);
            List<Integer> ids = manager.allocate(jobId, parallelism);

            String range = ids.get(0) + "-" + ids.get(ids.size() - 1);
            map.put("server-id", range);

            log.info("Allocated server-id range: {}", range);

        } catch (Exception e) {
            throw new RuntimeException("Failed to allocate MySQL server-id", e);
        }
    }

    /**
     * Fill basic MySQL connection information into config map.
     *
     * Includes:
     * - base-url
     * - username
     * - password
     *
     * @param map   Target configuration map
     * @param param MySQL connection parameters
     */
    private void fillBasicInfo(Map<String, Object> map,
                               MySQLConnectionParam param) {

        map.put("base-url", param.getUrl());
        map.put("username", param.getUser());
        map.put("password", param.getPassword());
    }

    /**
     * Fill synchronization mode related configuration.
     *
     * Supported modes:
     * - TABLE_LIST
     * - TABLE_PATTERN
     * - FULL_DATABASE
     *
     * Delegates to corresponding handler based on SyncMode.
     *
     * @param map    Target configuration map
     * @param config Job configuration
     * @param param  MySQL connection parameters
     */
    private void fillSyncMode(Map<String, Object> map,
                              Config config,
                              MySQLConnectionParam param) {
        if (!config.hasPath("mode")) {
            return;
        }
        SyncMode mode = SyncMode.of(config.getString("mode"));
        switch (mode) {
            case TABLE_LIST:
                handleTableList(map, config, param);
                break;
            case TABLE_PATTERN:
                handlePattern(map, config, param);
                break;
            case FULL_DATABASE:
                handleFullDatabase(map, param);
                break;
            default:
                throw new IllegalArgumentException("Unsupported mode: " + mode);
        }
    }

    /**
     * Fill startup mode configuration for CDC.
     *
     * Example:
     * - initial
     * - latest-offset
     *
     * @param map    Target configuration map
     * @param config Job configuration
     */
    private void fillStartupMode(Map<String, Object> map, Config config) {
        if (config.hasPath("startupMode")) {
            map.put("startup.mode", config.getString("startupMode"));
        }
    }

    /**
     * Enable or disable schema change capture.
     *
     * @param map    Target configuration map
     * @param config Job configuration
     */
    private void fillSchemaChange(Map<String, Object> map, Config config) {
        if (config.hasPath("schemaChange")) {
            map.put("schema-changes.enabled", config.getBoolean("schemaChange"));
        }
    }

    /**
     * Fill stop mode configuration for CDC job.
     *
     * Defines how the job should behave when stopping.
     *
     * @param map    Target configuration map
     * @param config Job configuration
     */
    private void fillStopMode(Map<String, Object> map, Config config) {
        if (config.hasPath("stopMode")) {
            map.put("stop.mode", config.getString("stopMode"));
        }
    }

    /**
     * Append extra custom parameters into the configuration map.
     *
     * All key-value pairs under "extraParams" will be flattened
     * and directly added into the final config.
     *
     * @param map    Target configuration map
     * @param config Job configuration
     */
    private void fillExtraParams(Map<String, Object> map, Config config) {

        if (!config.hasPath("extraParams")) {
            return;
        }

        Config extraConfig = config.getConfig("extraParams");

        for (Map.Entry<String, ConfigValue> entry : extraConfig.entrySet()) {
            map.put(entry.getKey(), entry.getValue().unwrapped());
        }
    }

    /**
     * Handle TABLE_LIST synchronization mode.
     *
     * Requirements:
     * - "table_list" must be provided
     *
     * This method:
     * 1. Prefixes table names with database name
     * 2. Fills "table-names" and "database-names"
     *
     * @param map    Target configuration map
     * @param config Job configuration
     * @param param  MySQL connection parameters
     */
    private void handleTableList(Map<String, Object> map,
                                 Config config,
                                 MySQLConnectionParam param) {

        if (!config.hasPath("table_list")) {
            throw new IllegalArgumentException("table_list is required for TABLE_LIST mode");
        }

        String database = param.getDatabase();
        List<String> tables = config.getStringList("table_list");

        List<String> fullNames = tables.stream()
                .map(t -> String.format("%s.%s", database, t))
                .collect(Collectors.toList());

        map.put("table-names", fullNames);
        map.put("database-names", Collections.singletonList(database));
    }

    /**
     * Handle TABLE_PATTERN synchronization mode.
     *
     * Requirements:
     * - "keyword" must be provided
     *
     * This method builds:
     * - database-pattern
     * - table-pattern (regex format)
     *
     * @param map    Target configuration map
     * @param config Job configuration
     * @param param  MySQL connection parameters
     */
    private void handlePattern(Map<String, Object> map,
                               Config config,
                               MySQLConnectionParam param) {

        if (!config.hasPath("keyword")) {
            throw new IllegalArgumentException("keyword is required for TABLE_PATTERN mode");
        }

        String database = param.getDatabase();
        String keyword = config.getString("keyword");

        String tablePattern = String.format("%s\\.%s", database, keyword);

        map.put("database-pattern", database);
        map.put("table-pattern", tablePattern);
    }

    /**
     * Handle FULL_DATABASE synchronization mode.
     *
     * This mode captures all tables in the specified database.
     * Internally uses regex pattern:
     *   {database}\\..*
     *
     * @param map   Target configuration map
     * @param param MySQL connection parameters
     */
    private void handleFullDatabase(Map<String, Object> map,
                                    MySQLConnectionParam param) {

        String database = param.getDatabase();
        String tablePattern = String.format("%s\\..*", database);

        map.put("database-pattern", database);
        map.put("table-pattern", tablePattern);
    }
}
