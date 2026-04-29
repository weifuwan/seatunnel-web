package org.apache.seatunnel.plugin.datasource.oracle.param;

import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.plugin.datasource.api.constants.DataSourceConstants;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcParamConverter;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbConnectType;

public class OracleParamConverter implements JdbcParamConverter {

    @Override
    public BaseConnectionParam createConnectionParams(String connectionJson) {
        OracleConnectionParam oracleConnectionParam = JSONUtils.parseObject(connectionJson, OracleConnectionParam.class);
        assert oracleConnectionParam != null;
        oracleConnectionParam.setUrl(buildUrl(oracleConnectionParam));
        return oracleConnectionParam;
    }

    @Override
    public void checkDatasourceParam(BaseConnectionParam baseConnectionParam) {

    }

    private String buildUrl(OracleConnectionParam param) {
        boolean isSid = DbConnectType.ORACLE_SID.equals(param.getConnectType());

        String prefix = isSid ? DataSourceConstants.JDBC_ORACLE_SID : DataSourceConstants.JDBC_ORACLE_SERVICE_NAME;
        String separator = isSid ? ":" : "/";

        return String.format("%s%s:%s%s%s",
                prefix,
                param.getHost(),
                param.getPort(),
                separator,
                param.getDatabase());
    }
}
