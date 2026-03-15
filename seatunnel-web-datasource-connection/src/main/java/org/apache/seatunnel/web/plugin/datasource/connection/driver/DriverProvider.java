package org.apache.seatunnel.web.plugin.datasource.connection.driver;

import org.apache.seatunnel.web.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.web.plugin.datasource.connection.api.DriverDescriptor;

public interface DriverProvider {
    DriverHandle getOrCreate(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void release(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void shutdown();
}

