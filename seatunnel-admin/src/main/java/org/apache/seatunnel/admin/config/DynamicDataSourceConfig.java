package org.apache.seatunnel.admin.config;


import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DynamicDataSourceConfig {
    
    @Autowired
    private DynamicDatabaseConfig databaseConfig;
    
    @Bean
    @Primary
    public DataSource dataSource() {
        DataSourceProperties properties = new DataSourceProperties();
        
        if ("h2".equalsIgnoreCase(databaseConfig.getDialect()) && databaseConfig.getH2().isEnabled()) {
            properties.setUrl(databaseConfig.getH2().getUrl());
            properties.setUsername(databaseConfig.getH2().getUsername());
            properties.setPassword(databaseConfig.getH2().getPassword());
            properties.setDriverClassName(databaseConfig.getH2().getDriverClassName());
            
            if (databaseConfig.getH2().isConsoleEnabled()) {
                System.setProperty("spring.h2.console.enabled", "true");
                System.setProperty("spring.h2.console.path", "/h2-console");
            }
            
        } else if ("mysql".equalsIgnoreCase(databaseConfig.getDialect()) && databaseConfig.getMysql().isEnabled()) {
            properties.setUrl(databaseConfig.getMysql().getUrl());
            properties.setUsername(databaseConfig.getMysql().getUsername());
            properties.setPassword(databaseConfig.getMysql().getPassword());
            properties.setDriverClassName(databaseConfig.getMysql().getDriverClassName());
            
        } else {
            throw new IllegalArgumentException(
                "Please check database configuration: dialect=" + databaseConfig.getDialect() + 
                ", corresponding database configuration is not enabled or incomplete"
            );
        }
        
        HikariDataSource dataSource = properties.initializeDataSourceBuilder()
            .type(HikariDataSource.class).build();
        dataSource.setMaximumPoolSize(databaseConfig.getPool().getMaximumPoolSize());
        dataSource.setIdleTimeout(databaseConfig.getPool().getIdleTimeout());
        dataSource.setConnectionTestQuery(databaseConfig.getPool().getConnectionTestQuery());
        
        return dataSource;
    }
}