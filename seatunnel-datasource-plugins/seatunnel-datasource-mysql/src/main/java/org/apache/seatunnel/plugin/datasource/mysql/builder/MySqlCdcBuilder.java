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

    private void fillBasicInfo(Map<String, Object> map,
                               MySQLConnectionParam param) {

        map.put("base-url", param.getUrl());
        map.put("username", param.getUser());
        map.put("password", param.getPassword());
    }

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

    private void fillStartupMode(Map<String, Object> map, Config config) {
        if (config.hasPath("startupMode")) {
            map.put("startup.mode", config.getString("startupMode"));
        }
    }

    private void fillSchemaChange(Map<String, Object> map, Config config) {
        if (config.hasPath("schemaChange")) {
            map.put("schema-changes.enabled", config.getBoolean("schemaChange"));
        }
    }

    private void fillStopMode(Map<String, Object> map, Config config) {
        if (config.hasPath("stopMode")) {
            map.put("stop.mode", config.getString("stopMode"));
        }
    }

    private void fillExtraParams(Map<String, Object> map, Config config) {

        if (!config.hasPath("extraParams")) {
            return;
        }

        Config extraConfig = config.getConfig("extraParams");

        for (Map.Entry<String, ConfigValue> entry : extraConfig.entrySet()) {
            map.put(entry.getKey(), entry.getValue().unwrapped());
        }
    }

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

    private void handleFullDatabase(Map<String, Object> map,
                                    MySQLConnectionParam param) {

        String database = param.getDatabase();
        String tablePattern = String.format("%s\\..*", database);

        map.put("database-pattern", database);
        map.put("table-pattern", tablePattern);
    }
}
