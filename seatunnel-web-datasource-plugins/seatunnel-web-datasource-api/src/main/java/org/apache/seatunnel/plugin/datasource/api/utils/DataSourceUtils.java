package org.apache.seatunnel.plugin.datasource.api.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.plugin.DataSourceProcessorProvider;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbType;

import java.util.Map;

/**
 * Utility class for working with DataSourceProcessor plugins.
 *
 * <p>
 * Provides helper methods to get a processor by database type and to build connection parameters
 * from a JSON string.
 * </p>
 */
@Slf4j
public class DataSourceUtils {

    public DataSourceUtils() {
    }

    /**
     * Build a BaseConnectionParam object from a JSON string for the given database type.
     *
     * @param dbType         the database type (e.g., MYSQL, POSTGRES)
     * @param connectionJson the JSON string containing connection configuration
     * @return a BaseConnectionParam object with parsed connection parameters
     */
    public static BaseConnectionParam buildConnectionParams(DbType dbType, String connectionJson) {
        return getDatasourceProcessor(dbType)
                .getParamConverter()
                .createConnectionParams(connectionJson);
    }

    public static void checkDatasourceParam(BaseConnectionParam baseConnectionParam) {
        getDatasourceProcessor(baseConnectionParam.getDbType()).getParamConverter().checkDatasourceParam(baseConnectionParam);
    }

    /**
     * Get the DataSourceProcessor instance for a given database type.
     *
     * @param dbType the database type
     * @return the registered DataSourceProcessor
     * @throws IllegalArgumentException if no processor is registered for the given type
     */
    public static DataSourceProcessor getDatasourceProcessor(DbType dbType) {
        Map<String, DataSourceProcessor> dataSourceProcessorMap =
                DataSourceProcessorProvider.getDataSourceProcessorMap();

        if (!dataSourceProcessorMap.containsKey(dbType.name())) {
            throw new IllegalArgumentException("Illegal datasource type: " + dbType.name());
        }
        return dataSourceProcessorMap.get(dbType.name());
    }
}
