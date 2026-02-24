package org.apache.seatunnel.plugin.datasource.connection;


import org.apache.seatunnel.plugin.datasource.connection.api.ConnectionManager;
import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceConfig;
import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.plugin.datasource.connection.driver.DriverHandle;
import org.apache.seatunnel.plugin.datasource.connection.driver.DriverProvider;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

public class DefaultConnectionManager implements ConnectionManager {

    private static final String SQL_STATE_CODE = "08001";

    private final DriverProvider driverProvider;

    public DefaultConnectionManager(DriverProvider driverProvider) {
        this.driverProvider = driverProvider;
    }

    @Override
    public Connection getConnection(DataSourceConfig config) throws SQLException {
        if (config == null || config.getUrl() == null) {
            throw new SQLException("The url cannot be null", SQL_STATE_CODE);
        }
        DriverHandle handle = driverProvider.getOrCreate(config.getDataSourceId(), config.getDriver());
        Properties info = config.toJdbcProperties();

        try {
            Connection conn = handle.driver().connect(config.getUrl(), info);
            if (conn == null) {
                throw new SQLException(
                        "driver.connect return null, No suitable driver found for url " + config.getUrl(),
                        SQL_STATE_CODE);
            }
            return conn;
        } catch (SQLException e) {
            throw new SQLException("Cannot create connection (" + e.getMessage() + ")", SQL_STATE_CODE, e);
        }
    }

    @Override
    public void release(DataSourceId dataSourceId) {
    }

    @Override
    public void shutdown() {
        driverProvider.shutdown();
    }
}

