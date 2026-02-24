package org.apache.seatunnel.plugin.datasource.api.jdbc;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.ConnectionParam;
import org.apache.seatunnel.plugin.datasource.connection.DefaultConnectionManager;
import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceConfig;
import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverDescriptor;
import org.apache.seatunnel.plugin.datasource.connection.driver.*;
import org.springframework.util.StringUtils;

import java.io.File;
import java.sql.Connection;
import java.util.Properties;

/**
 * Abstract JDBC connection provider for SeaTunnel.
 *
 * <p>
 * This class provides a generic JDBC connection handling mechanism for any type of
 * {@link BaseConnectionParam}. Concrete subclasses must implement driver-specific logic
 * such as providing the default driver class and driver location.
 * </p>
 *
 * @param <T> type of the connection parameter extending {@link BaseConnectionParam}
 */
@Slf4j
public abstract class AbstractJdbcConnectionProvider<T extends BaseConnectionParam>
        implements JdbcConnectionProvider {


    /**
     * Return the fully qualified name of the default JDBC driver class.
     *
     * @return driver class name
     */
    protected abstract String defaultDriverClass();

    /**
     * Resolve the location of the JDBC driver for the specific connection.
     *
     * @param t connection parameter
     * @return driver location (e.g., jar file path)
     */
    protected abstract String resolveDriverLocation(T t);

    /**
     * Hook for processing passwords if needed (e.g., decrypting).
     *
     * @param t           connection parameter
     * @param rawPassword raw password from configuration
     * @return processed password
     */
    protected String processPassword(T t, String rawPassword) {
        return rawPassword;
    }

    /**
     * Obtain a JDBC connection for the given connection parameters.
     *
     * @param connectionParam generic connection parameter
     * @return JDBC Connection
     */
    @Override
    @SneakyThrows
    public Connection getConnection(ConnectionParam connectionParam) {
        T t = cast(connectionParam);

        // Build connection properties
        Properties props = createConnectionProperties(t);
        DriverStorageStrategy storageStrategy =
                new DefaultDriverStorageStrategy(
                        DefaultDriverStorageStrategy.Mode.SHARED
                );

        ClassLoaderStrategy classLoaderStrategy =
                new SimpleSharedClassLoaderStrategy(Thread.currentThread().getContextClassLoader());

        DriverProvider driverProvider = new DefaultDriverProvider(storageStrategy, classLoaderStrategy);
        DefaultConnectionManager defaultConnectionManager = new DefaultConnectionManager(driverProvider);
        DataSourceId dsId = new DataSourceId("11");

        DriverDescriptor descriptor = new DriverDescriptor(
                defaultDriverClass(),
                java.util.Arrays.asList(resolveDriverLocation(t).split(",")),
                resolveDriverLocation(t)
        );

        java.util.Map<String, Object> extraProps = new java.util.HashMap<>();
        for (String name : props.stringPropertyNames()) {
            extraProps.put(name, props.getProperty(name));
        }

        String jdbcUrl = buildJdbcUrl(t);

        DataSourceConfig cfg = new DataSourceConfig(
                dsId,
                jdbcUrl,
                props.getProperty("user"),
                props.getProperty("password"),
                extraProps,
                descriptor
        );
        return defaultConnectionManager.getConnection(cfg);
    }

    /**
     * Build the JDBC URL from the connection parameters.
     *
     * @param connectionParam connection parameter
     * @return JDBC URL
     */
    private String buildJdbcUrl(ConnectionParam connectionParam) {
        T t = cast(connectionParam);
        return t.getUrl();
    }

    /**
     * Check if the data source is reachable by attempting to open a connection.
     *
     * @param connectionParam connection parameter
     * @return true if the connection succeeds, false otherwise
     */
    @Override
    public boolean checkDataSourceConnectivity(ConnectionParam connectionParam) {
        try (Connection ignored = getConnection(connectionParam)) {
            return true;
        } catch (Exception e) {
            log.error("Check JDBC connectivity error", e);
            return false;
        }
    }



    /**
     * Create connection properties including user and password.
     *
     * @param t connection parameter
     * @return Properties object for JDBC connection
     */
    private Properties createConnectionProperties(T t) {
        Properties p = new Properties();

        String user = t.getUser();
        if (!StringUtils.hasText(user)) {
            throw new RuntimeException("user is null");
        }
        p.put("user", user);

        String pwd = t.getPassword();
        if (!StringUtils.hasText(pwd)) {
            throw new RuntimeException("password is null");
        }
        p.put("password", processPassword(t, pwd));
        return p;
    }

    /**
     * Cast a generic ConnectionParam to the specific type T.
     *
     * @param param generic connection parameter
     * @return casted connection parameter
     */
    @SuppressWarnings("unchecked")
    private T cast(ConnectionParam param) {
        return (T) param;
    }
}
