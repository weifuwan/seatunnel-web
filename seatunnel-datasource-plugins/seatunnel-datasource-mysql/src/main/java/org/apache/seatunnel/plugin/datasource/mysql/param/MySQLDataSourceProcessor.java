package org.apache.seatunnel.plugin.datasource.mysql.param;

import com.google.auto.service.AutoService;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilderFactory;
import org.apache.seatunnel.plugin.datasource.api.jdbc.*;
import org.apache.seatunnel.plugin.datasource.mysql.connection.MySQLConnectionProvider;
import org.apache.seatunnel.plugin.datasource.mysql.metadata.MySQLCatalog;

@AutoService(DataSourceProcessor.class)
@Slf4j
public class MySQLDataSourceProcessor extends AbstractDataSourceProcessor {

    private final JdbcConnectionProvider connectionManager = new MySQLConnectionProvider();
    private final JdbcParamConverter paramConverter = new MySQLParamConverter();

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
        return new MySQLCatalog(connectionParam, connectionManager);
    }

    @Override
    public DbType getDbType() {
        return DbType.MYSQL;
    }

    @Override
    public DataSourceProcessor create() {
        return new MySQLDataSourceProcessor();
    }
}
