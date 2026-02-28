package org.apache.seatunnel.admin.builder.sink;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import org.apache.seatunnel.admin.service.DataSourceService;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;
import org.apache.seatunnel.communal.config.ConfigValidator;
import org.apache.seatunnel.communal.config.ReadonlyConfig;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.springframework.stereotype.Component;


/**
 * JDBC Sink node builder.
 *
 * <p>
 * This builder generates the HOCON configuration for a JDBC sink node in a SeaTunnel job.
 * It validates the configuration using the DataSourceProcessor and rules defined for the sink.
 * </p>
 */
@Component
public class JdbcSinkBuilder implements SinkNodeConfigBuilder {

    @Resource
    private DataSourceService dataSourceService; // Service to fetch data source details

    /**
     * Node type identifier.
     *
     * @return the node type string "sink"
     */
    @Override
    public String nodeType() {
        return "sink";
    }

    /**
     * Build the HOCON configuration for the JDBC sink node.
     *
     * <p>
     * Steps:
     * </p>
     * <ol>
     *     <li>Retrieve sinkId from input config</li>
     *     <li>Fetch the corresponding DataSourceVO from database</li>
     *     <li>Obtain the DataSourceProcessor based on dbType</li>
     *     <li>Build the sink HOCON configuration</li>
     *     <li>Validate the configuration using the processor rules</li>
     * </ol>
     *
     * @param data the input configuration containing sinkId, dbType, and other parameters
     * @return validated HOCON configuration for the sink node
     * @throws RuntimeException if sinkId is missing or DataSourceVO does not exist
     */
    @Override
    public Config build(Config data) {
        Long sinkId = data.getLong("sinkId");
        if (sinkId == null) {
            throw new RuntimeException("sinkId is null");
        }

        // Retrieve the data source from database
        DataSourceVO ds = dataSourceService.selectById(sinkId);
        if (ds == null) {
            throw new RuntimeException("Data source does not exist");
        }

        // Get processor based on database type
        DataSourceProcessor processor =
                DataSourceUtils.getDatasourceProcessor(DbType.valueOf(data.getString("dbType")));

        String pluginName = data.getString("pluginName");

        // Build sink configuration
        Config cfg = processor.getQueryBuilder(pluginName)
                .buildSinkHocon(ds.getConnectionParams(), data);

        // Validate configuration using processor-defined rules
        ConfigValidator.of(ReadonlyConfig.fromConfig(cfg))
                .validate(processor.sinkOptionRule());

        return cfg;
    }

    /**
     * Return the connector type name for this sink node.
     *
     * @param data input configuration
     * @return connector type string
     */
    @Override
    public String connectorName(Config data) {
        return data.getString("connectorType");
    }
}
