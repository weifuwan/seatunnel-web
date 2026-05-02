package org.apache.seatunnel.plugin.datasource.api.hocon.table;

import com.typesafe.config.Config;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;
import org.apache.seatunnel.plugin.datasource.api.jdbc.TablePath;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.apache.seatunnel.plugin.datasource.api.hocon.JdbcBatchConstants.*;

public class JdbcMultiSourceTargetBuilder implements JdbcSourceTargetBuilder {

    private final JdbcTableNameResolver tableNameResolver;

    public JdbcMultiSourceTargetBuilder(JdbcTableNameResolver tableNameResolver) {
        this.tableNameResolver = tableNameResolver;
    }

    @Override
    public void build(Config config,
                      Config conn,
                      Map<String, Object> map,
                      HoconBuildStage stage) {
        String database = JdbcConfigReaders.getString(conn, DATABASE, "");
        String schema = JdbcConfigReaders.getString(conn, SCHEMA, "");

        List<String> sourceTables = tableNameResolver.resolveSourceTableNames(config);
        List<Map<String, Object>> tableList = buildSourceTableList(database, schema, sourceTables);

        if (CollectionUtils.isEmpty(tableList)) {
            throw new IllegalArgumentException("Missing source table_list, table_list can not be empty");
        }

        map.put(TABLE_LIST, tableList);
    }

    private List<Map<String, Object>> buildSourceTableList(
            String database,
            String schema,
            List<String> sourceTables) {
        List<Map<String, Object>> tableList = new ArrayList<>();

        for (String table : sourceTables) {
            if (StringUtils.isBlank(table)) {
                continue;
            }

            String tablePath = table.trim();

            if (!tableNameResolver.isFullTablePath(tablePath)) {
                tablePath = TablePath.of(
                        normalizeBlank(database),
                        normalizeBlank(schema),
                        tablePath
                ).getFullName();
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put(TABLE_PATH, tablePath);
            tableList.add(item);
        }

        return tableList;
    }

    private String normalizeBlank(String value) {
        return StringUtils.isBlank(value) ? null : value.trim();
    }
}