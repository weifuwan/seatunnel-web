package org.apache.seatunnel.web.dao.plugin.postgresql;

import com.baomidou.mybatisplus.annotation.DbType;
import org.apache.seatunnel.web.dao.plugin.api.DaoPluginConfiguration;
import org.apache.seatunnel.web.dao.plugin.api.dialect.DatabaseDialect;
import org.apache.seatunnel.web.dao.plugin.api.monitor.DatabaseMonitor;
import org.apache.seatunnel.web.dao.plugin.postgresql.dialect.PostgresqlDialect;
import org.apache.seatunnel.web.dao.plugin.postgresql.monitor.PostgresqlMonitor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Conditional(PostgresqlDatabaseEnvironmentCondition.class)
@Configuration(proxyBeanMethods = false)
public class PostgresqlDaoPluginAutoConfiguration implements DaoPluginConfiguration {

    @Autowired
    private DataSource dataSource;

    @Override
    public DbType dbType() {
        return DbType.POSTGRE_SQL;
    }

    @Override
    public DatabaseMonitor databaseMonitor() {
        return new PostgresqlMonitor(dataSource);
    }

    @Override
    public DatabaseDialect databaseDialect() {
        return new PostgresqlDialect(dataSource);
    }
}
