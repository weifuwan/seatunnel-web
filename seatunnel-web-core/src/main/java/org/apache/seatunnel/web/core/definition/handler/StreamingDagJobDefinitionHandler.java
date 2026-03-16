package org.apache.seatunnel.web.core.definition.handler;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;
import org.apache.seatunnel.web.core.definition.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.core.definition.parser.JobDefinitionResolver;
import org.apache.seatunnel.web.core.hocon.JobConfigBuild;
import org.apache.seatunnel.web.core.utils.DagUtil;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.entity.NodeTypes;
import org.springframework.stereotype.Component;

@Component
public class StreamingDagJobDefinitionHandler extends AbstractJsonSupport implements JobDefinitionHandler {

    @Resource
    private JobDefinitionResolver jobDefinitionResolver;

    @Resource
    private JobConfigBuild jobConfigBuildService;

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