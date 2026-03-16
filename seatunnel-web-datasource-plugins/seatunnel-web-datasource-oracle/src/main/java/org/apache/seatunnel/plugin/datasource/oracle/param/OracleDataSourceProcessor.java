package org.apache.seatunnel.plugin.datasource.oracle.param;

import com.google.auto.service.AutoService;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilderFactory;
import org.apache.seatunnel.plugin.datasource.api.jdbc.*;
import org.apache.seatunnel.plugin.datasource.oracle.connection.OracleConnectionProvider;
import org.apache.seatunnel.plugin.datasource.oracle.metadata.OracleCatalog;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbType;

@AutoService(DataSourceProcessor.class)
@Slf4j
public class OracleDataSourceProcessor extends AbstractDataSourceProcessor {

    private final JdbcConnectionProvider connectionManager = new OracleConnectionProvider();
    private final JdbcParamConverter paramConverter = new OracleParamConverter();

    @Override
    public DataSourceHoconBuilder getQueryBuilder(String pluginName) {
        return DataSourceHoconBuilderFactory.getBuilder(pluginName);
    }

    @Override
    public JdbcConnectionProvider getConnectionManager() {
        return connectionManager;
    }

    @Override
    public JdbcParamConverter getParamConverter() {
        return paramConverter;
    }

    @Override
    public JdbcCatalog getMetadataService(BaseConnectionParam connectionParam) {
        return new OracleCatalog(connectionParam, connectionManager);
    }

    @Override
    public DbType getDbType() {
        return DbType.ORACLE;
    }

    @Override
    public DataSourceProcessor create() {
        return new OracleDataSourceProcessor();
    }

}
