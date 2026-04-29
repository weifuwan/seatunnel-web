package org.apache.seatunnel.web.dao.plugin.h2;

import com.baomidou.mybatisplus.annotation.DbType;
import org.apache.seatunnel.web.dao.plugin.api.DaoPluginConfiguration;
import org.apache.seatunnel.web.dao.plugin.api.dialect.DatabaseDialect;
import org.apache.seatunnel.web.dao.plugin.api.monitor.DatabaseMonitor;
import org.apache.seatunnel.web.dao.plugin.h2.dialect.H2Dialect;
import org.apache.seatunnel.web.dao.plugin.h2.monitor.H2Monitor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Conditional(H2DatabaseEnvironmentCondition.class)
@Configuration(proxyBeanMethods = false)
public class H2DaoPluginAutoConfiguration implements DaoPluginConfiguration {

    @Autowired
    private DataSource dataSource;

    @Override
    public DbType dbType() {
        return DbType.H2;
    }

    @Override
    public DatabaseMonitor databaseMonitor() {
        return new H2Monitor(dataSource);
    }

    @Override
    public DatabaseDialect databaseDialect() {
        return new H2Dialect();
    }

}
