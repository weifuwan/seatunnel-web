package org.apache.seatunnel.plugin.datasource.pgsql.param;

import org.apache.commons.collections.MapUtils;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.utils.JSONUtils;
import org.apache.seatunnel.plugin.datasource.api.constants.DataSourceConstants;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcParamConverter;

import java.util.Map;
import java.util.stream.Collectors;

public class PgSQLParamConverter implements JdbcParamConverter {

    @Override
    public BaseConnectionParam createConnectionParams(String connectionJson) {
        PgSQLConnectionParam pgSQLConnectionParam = JSONUtils.parseObject(connectionJson, PgSQLConnectionParam.class);
        assert pgSQLConnectionParam != null;
        pgSQLConnectionParam.setUrl(buildUrl(pgSQLConnectionParam));
        return pgSQLConnectionParam;
    }

    private String buildUrl(PgSQLConnectionParam pgSQLConnectionParam) {

        String base = String.format("%s%s:%s/%s",
                jdbcPrefix(),
                pgSQLConnectionParam.getHost(),
                pgSQLConnectionParam.getPort(),
                pgSQLConnectionParam.getDatabase());
        Map<String, String> other = pgSQLConnectionParam.getOtherAsMap();
        if (MapUtils.isEmpty(other)) {
            return base;
        }
        return base + "?" + buildQueryString(other);
    }

    private String jdbcPrefix() {
        return DataSourceConstants.JDBC_MYSQL;
    }

    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
    }

}
