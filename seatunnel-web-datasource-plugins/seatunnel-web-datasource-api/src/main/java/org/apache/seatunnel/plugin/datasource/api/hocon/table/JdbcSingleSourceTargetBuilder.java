package org.apache.seatunnel.plugin.datasource.api.hocon.table;

import com.typesafe.config.Config;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;

import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;

import static org.apache.seatunnel.plugin.datasource.api.hocon.JdbcBatchConstants.*;

public class JdbcSingleSourceTargetBuilder implements JdbcSourceTargetBuilder {

    private final JdbcTableNameResolver tableNameResolver;
    private final BiFunction<String, HoconBuildStage, String> queryStageHandler;
    private final TablePathBuilder tablePathBuilder;

    public JdbcSingleSourceTargetBuilder(
            JdbcTableNameResolver tableNameResolver,
            BiFunction<String, HoconBuildStage, String> queryStageHandler) {
        this.tableNameResolver = tableNameResolver;
        this.queryStageHandler = queryStageHandler;
        this.tablePathBuilder = null;
    }

    public JdbcSingleSourceTargetBuilder(
            JdbcTableNameResolver tableNameResolver,
            BiFunction<String, HoconBuildStage, String> queryStageHandler,
            TablePathBuilder tablePathBuilder) {
        this.tableNameResolver = tableNameResolver;
        this.queryStageHandler = queryStageHandler;
        this.tablePathBuilder = tablePathBuilder;
    }

    @Override
    public void build(Config config,
                      Config conn,
                      Map<String, Object> map,
                      HoconBuildStage stage) {
        String sql = JdbcConfigReaders.getString(config, SQL, "");
        if (StringUtils.isNotBlank(sql)) {
            map.put(QUERY, queryStageHandler.apply(sql, stage));
            return;
        }

        String database = JdbcConfigReaders.getString(conn, DATABASE, "");
        String schema = JdbcConfigReaders.getString(conn, SCHEMA, "");

        List<String> sourceTables = tableNameResolver.resolveSourceTableNames(config);
        String tablePath = resolveTablePath(config, database, schema, sourceTables);

        if (StringUtils.isBlank(tablePath)) {
            throw new IllegalArgumentException(
                    "Missing source table, one of query/table_path/table/table_list is required");
        }

        map.put(TABLE_PATH, tablePath);
    }

    /**
     * Resolve table path, using custom tablePathBuilder if available
     */
    private String resolveTablePath(Config config, String database, String schema, List<String> sourceTables) {
        String tablePath = JdbcConfigReaders.getString(config, TABLE_PATH, "");
        if (StringUtils.isNotBlank(tablePath)) {
            String trimmed = tablePath.trim();
            // If table_path is already a full path (contains dots), use it directly
            // Otherwise, it might be just a table name, need to build full path
            if (tableNameResolver.isFullTablePath(trimmed)) {
                return trimmed;
            }
            // table_path is just a table name, treat it as table and build full path
            return buildFullPathIfNecessary(database, schema, trimmed);
        }

        String table = JdbcConfigReaders.getString(config, TABLE, "");
        if (StringUtils.isBlank(table)) {
            table = tableNameResolver.firstTable(sourceTables);
        }

        if (StringUtils.isBlank(table)) {
            return "";
        }

        if (tableNameResolver.isFullTablePath(table)) {
            return table.trim();
        }

        return buildFullPathIfNecessary(database, schema, table.trim());
    }

    /**
     * Build full table path using custom builder if available
     */
    private String buildFullPathIfNecessary(String database, String schema, String table) {
        if (tablePathBuilder != null) {
            return tablePathBuilder.build(database, schema, table);
        }
        return tableNameResolver.buildTablePath(database, schema, table);
    }
}