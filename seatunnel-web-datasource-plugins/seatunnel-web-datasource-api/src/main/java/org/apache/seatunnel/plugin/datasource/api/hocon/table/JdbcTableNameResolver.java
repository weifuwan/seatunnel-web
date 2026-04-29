package org.apache.seatunnel.plugin.datasource.api.hocon.table;

import com.typesafe.config.Config;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;

import java.util.ArrayList;
import java.util.List;

import static org.apache.seatunnel.plugin.datasource.api.hocon.JdbcBatchConstants.*;


public class JdbcTableNameResolver {

    public List<String> resolveSourceTableNames(Config config) {
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

    public List<String> resolveSinkTableNames(Config config) {
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

    public JdbcTableMode resolveTableMode(Config config, List<String> tables) {
        if (config != null && JdbcConfigReaders.getBoolean(config, MULTI_TABLE, false)) {
            return JdbcTableMode.MULTI;
        }

        if (CollectionUtils.isNotEmpty(tables) && tables.size() > 1) {
            return JdbcTableMode.MULTI;
        }

        return JdbcTableMode.SINGLE;
    }

    public String resolveSingleSourceTablePath(
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

    public String buildTablePath(String database, String schema, String table) {
        if (StringUtils.isBlank(table)) {
            return "";
        }

        if (StringUtils.isNotBlank(database) && StringUtils.isNotBlank(schema)) {
            return database.trim() + "." + schema.trim() + "." + table.trim();
        }

        if (StringUtils.isNotBlank(database)) {
            return database.trim() + "." + table.trim();
        }

        if (StringUtils.isNotBlank(schema)) {
            return schema.trim() + "." + table.trim();
        }

        return table.trim();
    }

    public boolean isFullTablePath(String table) {
        return StringUtils.isNotBlank(table) && table.contains(".");
    }

    public String firstTable(List<String> tables) {
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

    private void addDistinct(List<String> target, String value) {
        if (StringUtils.isBlank(value)) {
            return;
        }

        String cleaned = value.trim();
        if (!target.contains(cleaned)) {
            target.add(cleaned);
        }
    }
}