package org.apache.seatunnel.plugin.datasource.connection.driver;


import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverClassPath;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverDescriptor;

import java.io.Serializable;

public interface DriverStorageStrategy extends Serializable {



    DriverClassPath prepare(DataSourceId dataSourceId, DriverDescriptor descriptor);


    void release(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void shutdown();
}

