package org.apache.seatunnel.web.api.service.domain.handler;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.components.parser.JobDefinitionResolver;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.service.domain.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.bean.entity.NodeTypes;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
public class BatchWholeSyncJobDefinitionHandler extends AbstractJsonSupport implements JobDefinitionHandler {

    @Resource
    private JobDefinitionResolver jobDefinitionResolver;

    @Lazy
    @Resource
    private SeaTunnelJobInstanceService seatunnelJobInstanceService;

    @Override
    public boolean supports(BaseJobDefinitionCommand command) {
        return command.getJobType() == JobMode.BATCH
                && command.getSyncMode() == SyncModeEnum.WHOLE_SYNC;
    }

    @Override
    public JobDefinitionAnalysisResult analyze(BaseJobDefinitionCommand command) {
        String jobInfo = command.getJobDefinitionInfo();
        NodeTypes nodeTypes = jobDefinitionResolver.resolveWholeSync(jobInfo);

        return JobDefinitionAnalysisResult.builder()
                .sourceType(nodeTypes.getSourceTypes())
                .sinkType(nodeTypes.getSinkTypes())
                .sourceTableJson(toJson(nodeTypes.getSourceTableMap()))
                .sinkTableJson(toJson(nodeTypes.getSinkTableMap()))
                .normalizedJobDefinitionInfo(jobInfo)
                .build();
    }

    @Override
    public String buildHoconConfig(BaseJobDefinitionCommand command) {
        return seatunnelJobInstanceService.buildHoconConfigByWholeSync((org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionDTO) command);
    }
}
