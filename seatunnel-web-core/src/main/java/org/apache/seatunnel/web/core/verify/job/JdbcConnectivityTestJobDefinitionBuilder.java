package org.apache.seatunnel.web.core.verify.job;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class JdbcConnectivityTestJobDefinitionBuilder implements ConnectivityTestJobDefinitionBuilder {

    private static final Set<DbType> SUPPORTED = new HashSet<DbType>(Arrays.asList(
            DbType.MYSQL,
            DbType.POSTGRE_SQL,
            DbType.ORACLE
    ));

    @Resource
    private ConnectivitySourcePluginResolver sourcePluginResolver;

    @Resource
    private ConsoleSinkHoconBuilder consoleSinkHoconBuilder;

    @Resource
    private TestJobEnvConfigBuilder testJobEnvConfigBuilder;

    @Resource
    private SeaTunnelJobConfigAssembler seaTunnelJobConfigAssembler;

    @Override
    public boolean supports(DbType dbType) {
        return SUPPORTED.contains(dbType);
    }

    @Override
    public ConnectivityTestJob build(SeaTunnelClient client, DataSource datasource) {
        String sourcePluginName = sourcePluginResolver.resolve(datasource.getDbType());

        DataSourceProcessor processor = DataSourceUtils.getDatasourceProcessor(datasource.getDbType());
        DataSourceHoconBuilder sourceBuilder = processor.getQueryBuilder(sourcePluginName);
        JdbcConnectionProvider connectionProvider = processor.getConnectionManager();

        Config sourceNodeConfig = buildMinimalSourceNodeConfig();
        Config sourceConfig = sourceBuilder.buildSourceHocon(
                datasource.getConnectionParams(),
                sourceNodeConfig,
                connectionProvider,
                HoconBuildStage.INSTANCE
        );

        String jobName = buildJobName(client.getId(), datasource.getId());
        String jobConfig = seaTunnelJobConfigAssembler.assemble(
                testJobEnvConfigBuilder.buildBatchEnv(),
                sourcePluginName,
                sourceConfig,
                consoleSinkHoconBuilder.pluginName(),
                consoleSinkHoconBuilder.build()
        );

        return new ConnectivityTestJob(jobName, jobConfig, "hocon", true);
    }

    private Config buildMinimalSourceNodeConfig() {
        Map<String, Object> map = new HashMap<String, Object>(4);
        map.put("query", "select 1 as connectivity_check");
        return ConfigFactory.parseMap(map);
    }

    private String buildJobName(Long clientId, Long datasourceId) {
        return "connectivity_check_" + datasourceId + "_" + clientId + "_" + System.currentTimeMillis();
    }
}
