package org.apache.seatunnel.web.core.builder.source;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
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
 * JDBC Source node builder.
 *
 * <p>
 * This builder generates the HOCON configuration for a JDBC source node in a SeaTunnel job.
 * It validates the configuration using the DataSourceProcessor and rules defined for the source.
 * </p>
 */
@Component
@Slf4j
public class JdbcSourceBuilder implements SourceNodeConfigBuilder {

    @Resource
    private DataSourceDao dataSourceDao; // Service to fetch data source details

    /**
     * Node type identifier.
     *
     * @return the node type string "source"
     */
    @Override
    public String nodeType() {
        return "source";
    }

    /**
     * Build the HOCON configuration for the JDBC source node.
     *
     * <p>
     * Steps:
     * </p>
     * <ol>
     *     <li>Retrieve sourceId from input config</li>
     *     <li>Fetch the corresponding DataSourceVO from database</li>
     *     <li>Obtain the DataSourceProcessor based on dbType</li>
     *     <li>Build the source HOCON configuration</li>
     *     <li>Validate the configuration using the processor rules</li>
     * </ol>
     *
     * @param data the input configuration containing sourceId, dbType, and other parameters
     * @return validated HOCON configuration for the source node
     * @throws RuntimeException if DataSourceVO does not exist
     */
    @Override
    public Config build(Config data) {
        Config config = resolveNodeConfig(data);

        Long sourceId = getLong(config, "sourceDataSourceId");
        if (sourceId == null) {
            throw new RuntimeException("sourceDataSourceId is missing");
        }

        DataSource ds = dataSourceDao.queryById(sourceId);
        if (ds == null) {
            throw new RuntimeException("Data source does not exist, id=" + sourceId);
        }

        String dbType = getString(config, "dbType");
        if (StringUtils.isBlank(dbType)) {
            throw new RuntimeException("dbType is missing");
        }

        String pluginName = getString(config, "pluginName");
        if (StringUtils.isBlank(pluginName)) {
            throw new RuntimeException("pluginName is missing");
        }

        DataSourceProcessor processor =
                DataSourceUtils.getDatasourceProcessor(DbType.valueOf(dbType));

        Config cfg = processor.getQueryBuilder(pluginName)
                .buildSourceHocon(
                        ds.getConnectionParams(),
                        config,
                        processor.getConnectionManager(),
                        HoconBuildStage.INSTANCE
                );

        ConfigValidator.of(ReadonlyConfig.fromConfig(cfg))
                .validate(processor.sourceOptionRule(pluginName));

        return cfg;
    }

    private String getString(Config config, String path) {
        return config.hasPath(path) ? config.getString(path) : null;
    }

    private Long getLong(Config config, String path) {
        if (!config.hasPath(path)) {
            return null;
        }
        Object value = config.getAnyRef(path);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return null;
        }
        return Long.valueOf(text);
    }
}
