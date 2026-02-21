package org.apache.seatunnel.plugin.datasource.api.jdbc;

import org.apache.seatunnel.communal.BaseConnectionParam;

/**
 * Converter for JDBC connection parameters.
 */
public interface JdbcParamConverter {

    /**
     * Create connection parameters from JSON string.
     *
     * @param connectionJson JSON string containing connection details
     * @return parsed connection parameters
     */
    BaseConnectionParam createConnectionParams(String connectionJson);
}