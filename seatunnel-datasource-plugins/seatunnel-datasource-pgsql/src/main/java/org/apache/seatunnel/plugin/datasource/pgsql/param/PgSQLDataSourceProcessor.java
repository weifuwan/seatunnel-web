package org.apache.seatunnel.plugin.datasource.pgsql.param;

import com.google.auto.service.AutoService;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilderFactory;
import org.apache.seatunnel.plugin.datasource.api.jdbc.*;
import org.apache.seatunnel.plugin.datasource.pgsql.connection.PgSQLConnectionProvider;
import org.apache.seatunnel.plugin.datasource.pgsql.metadata.PgSQLCatalog;

@AutoService(DataSourceProcessor.class)
@Slf4j
public class PgSQLDataSourceProcessor extends AbstractDataSourceProcessor {

    private final JdbcConnectionProvider connectionManager = new PgSQLConnectionProvider();
    private final JdbcParamConverter paramConverter = new PgSQLParamConverter();

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
        return new PgSQLCatalog(connectionParam, connectionManager);
    }

    @Override
    public DbType getDbType() {
        return DbType.PGSQL;
    }

    @Override
    public DataSourceProcessor create() {
        return new PgSQLDataSourceProcessor();
    }
}
