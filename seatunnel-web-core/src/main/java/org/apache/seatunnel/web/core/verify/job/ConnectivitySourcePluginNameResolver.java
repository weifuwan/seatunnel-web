package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

@Component
public class ConnectivitySourcePluginNameResolver {

    public String resolvePluginName(DbType dbType) {
        switch (dbType) {
            case MYSQL:
            case POSTGRE_SQL:
            case ORACLE:
                return "Jdbc";
            default:
                throw new IllegalArgumentException("暂不支持该数据源类型的 Source 插件名解析: " + dbType);
        }
    }
}