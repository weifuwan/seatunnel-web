package org.apache.seatunnel.web.core.verify.support;

import org.apache.seatunnel.web.core.verify.executor.JobExecutionResult;
import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJob;
import org.apache.seatunnel.web.core.verify.resolver.ConnectivityErrorResolver;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;

@Component
public class ConnectivityVerifyResultAssembler {

    @Resource
    private ConnectivityErrorResolver connectivityErrorResolver;

    public ClientDatasourceVerifyVO toVO(
            SeaTunnelClient client,
            DataSource datasource,
            ConnectivityTestJob job,
            JobExecutionResult executionResult) {

        ClientDatasourceVerifyVO vo = new ClientDatasourceVerifyVO();
        vo.setClientId(client.getId());
        vo.setClientName(client.getClientName());
        vo.setClientBaseUrl(client.getBaseUrl());
        vo.setDatasourceId(datasource.getId());
        vo.setDatasourceName(datasource.getName());
        vo.setDatasourceType(datasource.getDbType().toString());
        vo.setTestJobName(job.getJobName());
        vo.setTestJobId(executionResult.getJobId() == null ? null : String.valueOf(executionResult.getJobId()));
        vo.setFinalJobStatus(executionResult.getFinalStatus());
        vo.setDurationMs(executionResult.getDurationMs());
        vo.setSuccess(executionResult.isSuccess());

        if (executionResult.isSuccess()) {
            vo.setMessage("verification passed");
            vo.setErrorMessage(null);
        } else {
            vo.setMessage("Datasource connectivity verification failed");

            String resolved = executionResult.getErrorMessage();
            if (resolved == null || resolved.trim().isEmpty()) {
                resolved = connectivityErrorResolver.resolve(
                        executionResult.getRawLog(),
                        executionResult.getFinalStatus(),
                        datasource.getDbType()
                );
            }
            vo.setErrorMessage(resolved);
        }

        return vo;
    }
}
