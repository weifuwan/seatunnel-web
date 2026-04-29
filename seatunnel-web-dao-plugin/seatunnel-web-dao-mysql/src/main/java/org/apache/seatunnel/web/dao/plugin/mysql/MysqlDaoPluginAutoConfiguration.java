package org.apache.seatunnel.web.dao.plugin.mysql;

import com.baomidou.mybatisplus.annotation.DbType;
import org.apache.seatunnel.web.dao.plugin.api.DaoPluginConfiguration;
import org.apache.seatunnel.web.dao.plugin.api.dialect.DatabaseDialect;
import org.apache.seatunnel.web.dao.plugin.api.monitor.DatabaseMonitor;
import org.apache.seatunnel.web.dao.plugin.mysql.dialect.MysqlDialect;
import org.apache.seatunnel.web.dao.plugin.mysql.monitor.MysqlMonitor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration(proxyBeanMethods = false)
@Conditional(MysqlDatabaseEnvironmentCondition.class)
public class MysqlDaoPluginAutoConfiguration implements DaoPluginConfiguration {

    @Autowired
    private DataSource dataSource;

    @Override
    public DbType dbType() {
        return DbType.MYSQL;
    }

    @Override
    public DatabaseMonitor databaseMonitor() {
        return new MysqlMonitor(dataSource);
    }

    @Override
    public DatabaseDialect databaseDialect() {
        return new MysqlDialect(dataSource);
    }
}
