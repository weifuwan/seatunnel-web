package org.apache.seatunnel.plugin.datasource.pgsql.param;

import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.plugin.datasource.api.constants.DataSourceConstants;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcParamConverter;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;

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

    @Override
    public void checkDatasourceParam(BaseConnectionParam baseConnectionParam) {

    }

    private String buildUrl(PgSQLConnectionParam pgSQLConnectionParam) {

        return String.format("%s%s:%s/%s",
                jdbcPrefix(),
                pgSQLConnectionParam.getHost(),
                pgSQLConnectionParam.getPort(),
                pgSQLConnectionParam.getDatabase());
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
