package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

@Component
public class ConnectivitySourceBuilderResolver {

    public String resolveBuilderKey(DbType dbType) {
        return switch (dbType) {
            case MYSQL -> "JDBC-MYSQL";
            case POSTGRE_SQL -> "JDBC-POSTGRESQL";
            case ORACLE -> "JDBC-ORACLE";
            default -> throw new IllegalArgumentException("暂不支持该数据源类型的 Source Builder 解析: " + dbType);
        };
    }
}