package org.apache.seatunnel.web.core.job.handler;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.core.job.parser.JobDefinitionResolver;
import org.apache.seatunnel.web.core.hocon.JobConfigBuild;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.entity.NodeTypes;
import org.springframework.stereotype.Component;

@Component
public class BatchWholeSyncJobDefinitionHandler extends AbstractJsonSupport implements JobModeDefinitionHandler {

    @Resource
    private JobDefinitionResolver jobDefinitionResolver;

    @Resource
    private JobConfigBuild jobConfigBuild;

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
        return jobConfigBuild.buildWholeSyncConfig(command);
    }
}
