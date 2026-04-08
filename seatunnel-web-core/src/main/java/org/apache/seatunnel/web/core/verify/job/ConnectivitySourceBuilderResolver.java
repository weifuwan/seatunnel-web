package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

@Component
public class ConnectivitySourceBuilderResolver {

    public String resolveBuilderKey(DbType dbType) {
        switch (dbType) {
            case MYSQL:
                return "JDBC-MYSQL";
            case POSTGRE_SQL:
                return "JDBC-POSTGRE";
            case ORACLE:
                return "JDBC-ORACLE";
            default:
                throw new IllegalArgumentException("暂不支持该数据源类型的 Source Builder 解析: " + dbType);
        }
    }
}