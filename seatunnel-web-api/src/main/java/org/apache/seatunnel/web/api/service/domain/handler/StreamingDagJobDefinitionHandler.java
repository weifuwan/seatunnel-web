package org.apache.seatunnel.web.api.service.domain.handler;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.components.parser.JobDefinitionResolver;
import org.apache.seatunnel.web.api.service.domain.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.api.service.support.JobConfigBuildService;
import org.apache.seatunnel.web.api.utils.DagUtil;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.bean.entity.NodeTypes;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;
import org.springframework.stereotype.Component;

@Component
public class StreamingDagJobDefinitionHandler extends AbstractJsonSupport implements JobDefinitionHandler {

    @Resource
    private JobDefinitionResolver jobDefinitionResolver;

    @Resource
    private JobConfigBuildService jobConfigBuildService;

    @Override
    public boolean supports(BaseJobDefinitionCommand command) {
        return command.getJobType() == JobMode.STREAMING
                && command.getSyncMode() == SyncModeEnum.DAG;
    }

    @Override
    public JobDefinitionAnalysisResult analyze(BaseJobDefinitionCommand command) {
        String jobInfo = command.getJobDefinitionInfo();
        DagUtil.parseAndCheck(jobInfo);
        NodeTypes nodeTypes = jobDefinitionResolver.resolveDag(jobInfo);

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
        return jobConfigBuildService.buildStreamingConfig(command);
    }
}