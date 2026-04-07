package org.apache.seatunnel.web.core.verify.resolver;

import org.apache.seatunnel.web.spi.enums.DbType;

public interface ConnectivityErrorResolver {

    String resolve(String logContent, String finalStatus, DbType dbType);
}
