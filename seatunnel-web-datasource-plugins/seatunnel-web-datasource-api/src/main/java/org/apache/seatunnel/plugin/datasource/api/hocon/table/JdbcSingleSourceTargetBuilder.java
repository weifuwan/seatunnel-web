package org.apache.seatunnel.plugin.datasource.api.hocon.table;

import com.typesafe.config.Config;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;
import org.apache.seatunnel.plugin.datasource.api.jdbc.TablePath;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;
import org.apache.seatunnel.web.common.modal.JdbcQueryRenderContext;

import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;

import static org.apache.seatunnel.plugin.datasource.api.hocon.JdbcBatchConstants.*;

public class JdbcSingleSourceTargetBuilder implements JdbcSourceTargetBuilder {

    private final JdbcTableNameResolver tableNameResolver;
    private final BiFunction<String, JdbcQueryRenderContext, String> queryRenderHandler;

    public JdbcSingleSourceTargetBuilder(
            JdbcTableNameResolver tableNameResolver,
            BiFunction<String, JdbcQueryRenderContext, String> queryRenderHandler) {
        this.tableNameResolver = tableNameResolver;
        this.queryRenderHandler = queryRenderHandler;
    }

    @Override
    public void build(Config config,
                      Config conn,
                      Map<String, Object> map,
                      HoconBuildStage stage) {
        String sql = JdbcConfigReaders.getString(config, SQL, "");
        if (StringUtils.isNotBlank(sql)) {
            JdbcQueryRenderContext renderContext =
                    new JdbcQueryRenderContext(config, conn, stage, null);

            map.put(QUERY, queryRenderHandler.apply(sql, renderContext));
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

    private String resolveTablePath(
            Config config,
            String database,
            String schema,
            List<String> sourceTables) {
        String tablePath = JdbcConfigReaders.getString(config, TABLE_PATH, "");
        if (StringUtils.isNotBlank(tablePath)) {
            String trimmed = tablePath.trim();

            if (tableNameResolver.isFullTablePath(trimmed)) {
                return trimmed;
            }

            return buildTablePath(database, schema, trimmed);
        }

        String table = JdbcConfigReaders.getString(config, TABLE, "");
        if (StringUtils.isBlank(table)) {
            table = tableNameResolver.firstTable(sourceTables);
        }

        if (StringUtils.isBlank(table)) {
            return "";
        }

        String trimmed = table.trim();
        if (tableNameResolver.isFullTablePath(trimmed)) {
            return trimmed;
        }

        return buildTablePath(database, schema, trimmed);
    }

    private String buildTablePath(String database, String schema, String table) {
        return TablePath.of(
                normalizeBlank(database),
                normalizeBlank(schema),
                table
        ).getFullName();
    }

    private String normalizeBlank(String value) {
        return StringUtils.isBlank(value) ? null : value.trim();
    }
}