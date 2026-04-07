package org.apache.seatunnel.web.core.verify;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.core.verify.executor.JobExecutionResult;
import org.apache.seatunnel.web.core.verify.executor.SeaTunnelTestJobExecutor;
import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJob;
import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJobFactory;
import org.apache.seatunnel.web.core.verify.support.ConnectivityVerifyResultAssembler;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class JdbcDatasourceConnectivityVerificationStrategy
        implements DatasourceConnectivityVerificationStrategy {

    private static final Set<DbType> SUPPORTED = new HashSet<DbType>(Arrays.asList(
            DbType.MYSQL,
            DbType.POSTGRE_SQL,
            DbType.ORACLE
    ));

    @Resource
    private ConnectivityTestJobFactory connectivityTestJobFactory;

    @Resource
    private SeaTunnelTestJobExecutor seaTunnelTestJobExecutor;

    @Resource
    private ConnectivityVerifyResultAssembler connectivityVerifyResultAssembler;

    @Override
    public boolean supports(DbType dbType) {
        return SUPPORTED.contains(dbType);
    }

    @Override
    public ClientDatasourceVerifyVO verify(
            SeaTunnelClient client,
            DataSource datasource,
            long timeoutMs,
            long pollIntervalMs) {

        ConnectivityTestJob testJob = connectivityTestJobFactory.build(client, datasource);
        JobExecutionResult executionResult = seaTunnelTestJobExecutor.executeAndWait(
                client,
                testJob,
                timeoutMs,
                pollIntervalMs
        );

        return connectivityVerifyResultAssembler.toVO(
                client,
                datasource,
                testJob,
                executionResult
        );
    }
}
