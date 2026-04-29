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

    public JdbcSingleSourceTargetBuilder(
            JdbcTableNameResolver tableNameResolver,
            BiFunction<String, HoconBuildStage, String> queryStageHandler) {
        this.tableNameResolver = tableNameResolver;
        this.queryStageHandler = queryStageHandler;
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
        String tablePath = tableNameResolver.resolveSingleSourceTablePath(
                config,
                database,
                schema,
                sourceTables);

        if (StringUtils.isBlank(tablePath)) {
            throw new IllegalArgumentException(
                    "Missing source table, one of query/table_path/table/table_list is required");
        }

        map.put(TABLE_PATH, tablePath);
    }
}