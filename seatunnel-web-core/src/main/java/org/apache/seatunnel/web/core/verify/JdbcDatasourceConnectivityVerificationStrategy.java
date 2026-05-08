package org.apache.seatunnel.web.core.verify;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.core.verify.executor.JobExecutionResult;
import org.apache.seatunnel.web.core.verify.executor.SeaTunnelTestJobExecutor;
import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJob;
import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJobFactory;
import org.apache.seatunnel.web.core.verify.modal.DatasourceVerifyContext;
import org.apache.seatunnel.web.core.verify.support.ConnectivityVerifyResultAssembler;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyItemVO;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class JdbcDatasourceConnectivityVerificationStrategy
        implements DatasourceConnectivityVerificationStrategy {

    private static final Set<DbType> SUPPORTED = new HashSet<>(Arrays.asList(
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
    public boolean supports(DatasourceVerifyContext context) {
        if (context == null || context.getDbType() == null) {
            return false;
        }

        return SUPPORTED.contains(context.getDbType())
                && !isCdcPlugin(context.getPluginName());
    }

    @Override
    public ClientDatasourceVerifyVO verify(DatasourceVerifyContext context) {
        return doVerify(context);
    }

    /**
     * 给 CDC 策略复用。
     *
     * CDC 场景也需要先确认客户端能通过 SeaTunnel 访问该数据源。
     */
    public ClientDatasourceVerifyVO doVerify(DatasourceVerifyContext context) {
        ConnectivityTestJob testJob = connectivityTestJobFactory.build(
                context.getClient(),
                context.getDatasource()
        );

        JobExecutionResult executionResult = seaTunnelTestJobExecutor.executeAndWait(
                context.getClient(),
                testJob,
                context.getTimeoutMs(),
                context.getPollIntervalMs()
        );

        ClientDatasourceVerifyVO vo = connectivityVerifyResultAssembler.toVO(
                context.getClient(),
                context.getDatasource(),
                testJob,
                executionResult
        );

        if (vo.getItems() == null || vo.getItems().isEmpty()) {
            vo.addItem(buildJdbcItem(vo));
        }

        return vo;
    }

    private ClientDatasourceVerifyItemVO buildJdbcItem(ClientDatasourceVerifyVO vo) {
        boolean success = Boolean.TRUE.equals(vo.getSuccess());

        if (success) {
            return ClientDatasourceVerifyItemVO.success(
                    "JDBC_HOCON_CONNECTIVITY",
                    "基础连通性",
                    "SeaTunnel 测试任务执行成功",
                    "SeaTunnel 测试任务执行成功",
                    "客户端可以通过 SeaTunnel 访问该数据源"
            );
        }

        return ClientDatasourceVerifyItemVO.fail(
                "JDBC_HOCON_CONNECTIVITY",
                "基础连通性",
                StringUtils.defaultIfBlank(vo.getErrorMessage(), vo.getMessage()),
                "SeaTunnel 测试任务执行成功",
                "客户端无法通过 SeaTunnel 访问该数据源"
        );
    }

    private boolean isCdcPlugin(String pluginName) {
        return StringUtils.containsIgnoreCase(pluginName, "CDC");
    }
}