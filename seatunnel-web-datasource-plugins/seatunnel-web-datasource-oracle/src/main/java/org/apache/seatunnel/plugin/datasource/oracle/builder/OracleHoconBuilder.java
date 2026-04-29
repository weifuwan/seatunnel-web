package org.apache.seatunnel.plugin.datasource.oracle.builder;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.plugin.datasource.api.constants.DataSourceConstants;
import org.apache.seatunnel.plugin.datasource.api.jdbc.AbstractJdbcHoconBuilder;

@Slf4j
public class OracleHoconBuilder extends AbstractJdbcHoconBuilder {

    @Override
    protected String defaultDriver() {
        return DataSourceConstants.COM_ORACLE_JDBC_DRIVER;
    }

    @Override
    protected String buildTablePath(String database, String schemaName, String table) {
        return String.format("%s.%s.%s", database, schemaName, table);
    }
}
