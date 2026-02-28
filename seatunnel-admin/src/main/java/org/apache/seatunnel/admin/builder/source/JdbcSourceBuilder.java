package org.apache.seatunnel.admin.builder.source;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.DataSourceService;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;
import org.apache.seatunnel.communal.config.ConfigValidator;
import org.apache.seatunnel.communal.config.ReadonlyConfig;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
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
    private DataSourceService dataSourceService; // Service to fetch data source details

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
        Long sourceId = data.getLong("sourceId");

        // Retrieve the data source from database
        DataSourceVO ds = dataSourceService.selectById(sourceId);
        if (ds == null) {
            throw new RuntimeException("Data source does not exist");
        }

        // Get processor based on database type
        DataSourceProcessor processor =
                DataSourceUtils.getDatasourceProcessor(DbType.valueOf(data.getString("dbType")));

        String pluginName = data.getString("pluginName");
        // Build source configuration
        Config cfg = processor.getQueryBuilder(pluginName)
                .buildSourceHocon(ds.getConnectionParams(), data, processor.getConnectionManager());

        // Validate configuration using processor-defined rules
        ConfigValidator.of(ReadonlyConfig.fromConfig(cfg))
                .validate(processor.sourceOptionRule(pluginName));

        return cfg;
    }
}
