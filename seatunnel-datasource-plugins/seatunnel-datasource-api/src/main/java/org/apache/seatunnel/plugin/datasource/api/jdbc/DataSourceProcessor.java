package org.apache.seatunnel.plugin.datasource.api.jdbc;

import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.config.OptionRule;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;

/**
 * Data-source-level plugin entry.
 * Implementations provide all JDBC-related helpers for a specific RDBMS.
 */
public interface DataSourceProcessor {

    /**
     * SQL builder for this database.
     */
    DataSourceHoconBuilder getQueryBuilder(String pluginName);

    /**
     * Connection factory for this database.
     */
    JdbcConnectionProvider getConnectionManager();

    /**
     * JSON-to-param converter for this database.
     */
    JdbcParamConverter getParamConverter();

    /**
     * Metadata reader for this database.
     */
    JdbcCatalog getMetadataService(BaseConnectionParam connectionParam);

    /**
     * Validated option set for source (read) side.
     */
    OptionRule sourceOptionRule(String pluginName);

    /**
     * Validated option set for sink (write) side.
     */
    OptionRule sinkOptionRule();

    /**
     * Database type identifier.
     */
    DbType getDbType();

    /**
     * Create a new processor instance.
     * Allows each thread to obtain an isolated copy.
     */
    DataSourceProcessor create();
}