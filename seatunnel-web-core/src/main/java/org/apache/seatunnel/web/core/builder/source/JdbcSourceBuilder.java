package org.apache.seatunnel.web.core.builder.source;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.common.config.ConfigValidator;
import org.apache.seatunnel.web.common.config.ReadonlyConfig;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.repository.DataSourceDao;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

/**
 * JDBC source node builder.
 */
@Component
public class JdbcSourceBuilder implements SourceNodeConfigBuilder {

    private static final String NODE_TYPE = "source";
    private static final String KEY_DATA_SOURCE_ID = "dataSourceId";
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
        Config config = resolveNodeConfig(data);

        Long dataSourceId = parseDataSourceId(config);
        DataSource dataSource = getRequiredDataSource(dataSourceId);
        DbType dbType = parseDbType(config);

        String pluginName = getRequiredPluginName(config);

        DataSourceProcessor processor = DataSourceUtils.getDatasourceProcessor(dbType);
        Config sourceConfig = processor.getQueryBuilder(pluginName)
                .buildSourceHocon(
                        dataSource.getConnectionParams(),
                        config,
                        processor.getConnectionManager(),
                        HoconBuildStage.INSTANCE
                );

        validateSourceConfig(processor, pluginName, sourceConfig);
        return sourceConfig;
    }

    /**
     * Prefer connectorType as connector name.
     */
    @Override
    public String connectorName(Config data) {
        String connectorType = getTrimmedString(data, KEY_CONNECTOR_TYPE);
        if (StringUtils.isNotBlank(connectorType)) {
            return connectorType;
        }

        throw new IllegalArgumentException(
                "Missing connector name, field '" + KEY_CONNECTOR_TYPE + "' is not provided");
    }

    private Long parseDataSourceId(Config config) {
        String value = getTrimmedString(config, KEY_DATA_SOURCE_ID);
        if (StringUtils.isBlank(value)) {
            throw new IllegalArgumentException(
                    "Missing required field '" + KEY_DATA_SOURCE_ID + "' in source node config");
        }

        try {
            return Long.valueOf(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid '" + KEY_DATA_SOURCE_ID + "': " + value + ", expected numeric value", e);
        }
    }

    private DataSource getRequiredDataSource(Long dataSourceId) {
        DataSource dataSource = dataSourceDao.queryById(dataSourceId);
        if (dataSource == null) {
            throw new IllegalArgumentException(
                    "Source data source does not exist, dataSourceId=" + dataSourceId);
        }
        return dataSource;
    }

    private DbType parseDbType(Config config) {
        String dbTypeValue = getTrimmedString(config, KEY_DB_TYPE);
        if (StringUtils.isBlank(dbTypeValue)) {
            throw new IllegalArgumentException(
                    "Missing required field '" + KEY_DB_TYPE + "' in source node config");
        }

        try {
            return DbType.valueOf(dbTypeValue);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported dbType: " + dbTypeValue, e);
        }
    }

    private String getRequiredPluginName(Config config) {
        String pluginName = getTrimmedString(config, KEY_PLUGIN_NAME);
        if (StringUtils.isBlank(pluginName)) {
            throw new IllegalArgumentException(
                    "Missing required field '" + KEY_PLUGIN_NAME + "' in source node config");
        }
        return pluginName;
    }

    private void validateSourceConfig(
            DataSourceProcessor processor,
            String pluginName,
            Config sourceConfig) {
        ConfigValidator.of(ReadonlyConfig.fromConfig(sourceConfig))
                .validate(processor.sourceOptionRule(pluginName));
    }

    private String getTrimmedString(Config config, String path) {
        if (config == null || !config.hasPath(path)) {
            return null;
        }
        String value = config.getString(path);
        return value == null ? null : value.trim();
    }
}