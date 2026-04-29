package org.apache.seatunnel.web.dao.plugin.api;

import com.baomidou.mybatisplus.annotation.DbType;
import org.apache.seatunnel.web.dao.plugin.api.dialect.DatabaseDialect;
import org.apache.seatunnel.web.dao.plugin.api.monitor.DatabaseMonitor;

/**
 * DaoPluginConfiguration used to configure the dao plugin.
 */
public interface DaoPluginConfiguration {

    DbType dbType();

    DatabaseMonitor databaseMonitor();

    DatabaseDialect databaseDialect();

}
