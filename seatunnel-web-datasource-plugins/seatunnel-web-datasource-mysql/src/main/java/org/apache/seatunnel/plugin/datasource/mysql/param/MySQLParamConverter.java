package org.apache.seatunnel.plugin.datasource.mysql.param;

import org.apache.commons.collections4.MapUtils;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.plugin.datasource.api.constants.DataSourceConstants;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcParamConverter;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;

import java.util.Map;
import java.util.stream.Collectors;

public class MySQLParamConverter implements JdbcParamConverter {

    @Override
    public BaseConnectionParam createConnectionParams(String connectionJson) {
        MySQLConnectionParam mySQLConnectionParam = JSONUtils.parseObject(connectionJson, MySQLConnectionParam.class);
        assert mySQLConnectionParam != null;
        mySQLConnectionParam.setUrl(buildUrl(mySQLConnectionParam));
        return mySQLConnectionParam;
    }

    @Override
    public void checkDatasourceParam(BaseConnectionParam baseConnectionParam) {

    }

    private String buildUrl(MySQLConnectionParam mySQLConnectionParam) {

        String base = String.format("%s%s:%s/%s",
                jdbcPrefix(),
                mySQLConnectionParam.getHost(),
                mySQLConnectionParam.getPort(),
                mySQLConnectionParam.getDatabase());
        Map<String, String> other = mySQLConnectionParam.getOtherAsMap();
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
