package org.apache.seatunnel.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Component
@ConfigurationProperties(prefix = "datasource")
@Data
public class DynamicDatabaseConfig {
    
    private String dialect = "h2";
    private H2Config h2 = new H2Config();
    private MysqlConfig mysql = new MysqlConfig();
    private PoolConfig pool = new PoolConfig();
    
    @Data
    public static class H2Config {
        private boolean enabled = true;
        private boolean consoleEnabled = true;
        private String url = "jdbc:h2:mem:seatunnel_web;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL";
        private String username = "sa";
        private String password = "";
        private String driverClassName = "org.h2.Driver";
    }
    
    @Data
    public static class MysqlConfig {
        private boolean enabled = false;
        private String url;
        private String username;
        private String password;
        private String driverClassName = "com.mysql.cj.jdbc.Driver";
    }
    
    @Data
    public static class PoolConfig {
        private int maximumPoolSize = 20;
        private long idleTimeout = 30000;
        private String connectionTestQuery = "SELECT 1";
    }
}