package org.apache.seatunnel.plugin.datasource.api.hocon;

import com.typesafe.config.Config;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;

/**
 * Builder interface for generating SeaTunnel HOCON configurations
 * for different data sources.
 *
 * <p>
 * Implementations of this interface are responsible for constructing
 * the final HOCON configuration used by SeaTunnel Source and Sink plugins.
 * </p>
 *
 * <p>
 * Different implementations may represent different execution modes
 * (e.g., batch JDBC, CDC streaming) or different database types
 * (e.g., MySQL, PostgreSQL).
 * </p>
 */
public interface DataSourceHoconBuilder {

    /**
     * Build the HOCON configuration for a Source plugin.
     *
     * @param connectionParam the serialized connection configuration
     *                        (usually stored as JSON or HOCON string)
     * @param config          the node-level configuration provided by the job
     * @return a Config object representing the final Source HOCON configuration
     */
    Config buildSourceHocon(String connectionParam, Config config, JdbcConnectionProvider jdbcConnectionProvider);

    /**
     * Build the HOCON configuration for a Sink plugin.
     *
     * @param connectionParam the serialized connection configuration
     *                        (usually stored as JSON or HOCON string)
     * @param config          the node-level configuration provided by the job
     * @return a Config object representing the final Sink HOCON configuration
     */
    Config buildSinkHocon(String connectionParam, Config config);

    /**
     * Unique plugin name / key for this builder, e.g. "mysql-streaming" or "postgresql-batch".
     * Used for dynamic discovery in the factory.
     */
    String pluginName();
}
