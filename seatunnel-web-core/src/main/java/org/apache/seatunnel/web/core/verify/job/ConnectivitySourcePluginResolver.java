package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

/**
 * Resolve which source plugin name should be used for datasource connectivity verification.
 *
 * Current implementation uses generic JDBC plugin for common relational databases.
 * If your project uses different plugin names, adjust here only.
 */
@Component
public class ConnectivitySourcePluginResolver {

    public String resolve(DbType dbType) {
        switch (dbType) {
            case MYSQL:
            case POSTGRE_SQL:
            case ORACLE:
                return "Jdbc";
            default:
                throw new IllegalArgumentException("暂不支持该数据源类型的 Source 插件解析: " + dbType);
        }
    }
}
