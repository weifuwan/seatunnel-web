package org.apache.seatunnel.plugin.datasource.connection.driver;


import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverClassPath;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverDescriptor;

import java.io.File;
import java.io.Serializable;

public interface DriverStorageStrategy extends Serializable {


    /**
     * 准备 driver 所需的 jar（下载/拷贝/校验），并返回 DriverClassPath
     */
    DriverClassPath prepare(DataSourceId dataSourceId, DriverDescriptor descriptor);

    /**
     * 引用计数 + 清理策略（SHARED 通常减 ref；ISOLATED 通常直接删）
     */
    void release(DataSourceId dataSourceId, DriverDescriptor descriptor);

    void shutdown();
}

