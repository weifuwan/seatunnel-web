package org.apache.seatunnel.web.core.builder.sink;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.common.config.ConfigValidator;
import org.apache.seatunnel.web.common.config.ReadonlyConfig;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.repository.DataSourceDao;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

/**
 * JDBC sink node builder.
 */
@Component
public class JdbcSinkBuilder implements SinkNodeConfigBuilder {

    private static final String NODE_TYPE = "sink";
    private static final String KEY_SINK_DATA_SOURCE_ID = "sinkDataSourceId";
    private static final String KEY_DB_TYPE = "dbType";
    private static final String KEY_PLUGIN_NAME = "pluginName";
    private static final String KEY_CONNECTOR_TYPE = "connectorType";

    @Resource
    private DataSourceDao dataSourceDao;

    @Override
    public String nodeType() {
        return NODE_TYPE;
    }

    @Override
    public Config build(Config data) {
        Long sinkDataSourceId = parseSinkDataSourceId(data);
        DataSource dataSource = getRequiredDataSource(sinkDataSourceId);
        DbType dbType = parseDbType(data);

        String pluginName = getString(data, "pluginName");
        if (StringUtils.isBlank(pluginName)) {
            throw new RuntimeException("pluginName is missing");
        }

        DataSourceProcessor processor = DataSourceUtils.getDatasourceProcessor(dbType);
        Config sinkConfig = processor.getQueryBuilder(pluginName)
                .buildSinkHocon(dataSource.getConnectionParams(), data);

        validateSinkConfig(processor, sinkConfig);
        return sinkConfig;
    }

    private String getString(Config config, String path) {
        return config.hasPath(path) ? config.getString(path) : null;
    }

    /**
     * Prefer pluginName. Fall back to connectorType when pluginName is blank.
     */
    @Override
    public String connectorName(Config data) {

        String connectorType = getTrimmedString(data, KEY_CONNECTOR_TYPE);
        if (StringUtils.isNotBlank(connectorType)) {
            return connectorType;
        }

        throw new IllegalArgumentException(
                "Missing connector name, neither '" + KEY_PLUGIN_NAME + "' nor '" + KEY_CONNECTOR_TYPE + "' is provided");
    }

    private Long parseSinkDataSourceId(Config data) {
        String value = getTrimmedString(data, KEY_SINK_DATA_SOURCE_ID);
        if (StringUtils.isBlank(value)) {
            throw new IllegalArgumentException(
                    "Missing required field '" + KEY_SINK_DATA_SOURCE_ID + "' in sink node config");
        }

        try {
            return Long.valueOf(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid '" + KEY_SINK_DATA_SOURCE_ID + "': " + value + ", expected numeric value", e);
        }
    }

    private DataSource getRequiredDataSource(Long sinkDataSourceId) {
        DataSource dataSource = dataSourceDao.queryById(sinkDataSourceId);
        if (dataSource == null) {
            throw new IllegalArgumentException(
                    "Sink data source does not exist, sinkDataSourceId=" + sinkDataSourceId);
        }
        return dataSource;
    }

    private DbType parseDbType(Config data) {
        String dbTypeValue = getTrimmedString(data, KEY_DB_TYPE);
        if (StringUtils.isBlank(dbTypeValue)) {
            throw new IllegalArgumentException("Missing required field '" + KEY_DB_TYPE + "' in sink node config");
        }

        try {
            return DbType.valueOf(dbTypeValue);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported dbType: " + dbTypeValue, e);
        }
    }

    private void validateSinkConfig(DataSourceProcessor processor, Config sinkConfig) {
        ConfigValidator.of(ReadonlyConfig.fromConfig(sinkConfig))
                .validate(processor.sinkOptionRule());
    }

    private String getTrimmedString(Config data, String path) {
        if (data == null || !data.hasPath(path)) {
            return null;
        }
        String value = data.getString(path);
        return value == null ? null : value.trim();
    }
}