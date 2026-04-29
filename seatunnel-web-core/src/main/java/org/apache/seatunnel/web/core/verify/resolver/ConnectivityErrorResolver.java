package org.apache.seatunnel.web.core.verify.resolver;

import org.apache.seatunnel.web.spi.enums.DbType;

/**
 * Resolve user-friendly connectivity error messages from verification results.
 */
public interface ConnectivityErrorResolver {

    /**
     * Resolve the final error message based on logs, status, and datasource type.
     */
    String resolve(String logContent, String finalStatus, DbType dbType);
}