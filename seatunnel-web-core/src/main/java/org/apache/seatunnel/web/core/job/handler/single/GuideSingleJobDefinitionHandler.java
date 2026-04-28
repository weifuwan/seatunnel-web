package org.apache.seatunnel.web.core.job.handler.single;


import com.fasterxml.jackson.core.type.TypeReference;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class GuideSingleJobDefinitionHandler implements JobDefinitionModeHandler {

    private final GuideSingleWorkflowValidator workflowValidator;
    private final GuideSingleWorkflowAnalyzer workflowAnalyzer;
    private final GuideSingleHoconBuildService hoconBuildService;

    public GuideSingleJobDefinitionHandler(
            GuideSingleWorkflowValidator workflowValidator,
            GuideSingleWorkflowAnalyzer workflowAnalyzer,
            GuideSingleHoconBuildService hoconBuildService) {
        this.workflowValidator = workflowValidator;
        this.workflowAnalyzer = workflowAnalyzer;
        this.hoconBuildService = hoconBuildService;
    }

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.GUIDE_SINGLE == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;
        workflowValidator.validate(cmd.getWorkflow());
    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;
        return workflowAnalyzer.analyze(cmd.getWorkflow());
    }

    @Override
    public String serializeDefinition(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;
        return JSONUtils.toJsonString(cmd.getWorkflow());
    }

    @Override
    public String buildHoconConfig(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;
        return hoconBuildService.build(cmd);
    }

    @Override
    public JobDefinitionSaveCommand buildEditCommand(
            JobDefinitionEntity definition,
            JobDefinitionContentEntity jobDefinitionContentEntity,
            JobScheduleConfig scheduleConfig) {

        GuideSingleJobSaveCommand cmd = new GuideSingleJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setSchedule(scheduleConfig);
        Map<String, Object> workflow = JSONUtils.parseObject(
                jobDefinitionContentEntity.getDefinitionContent(),
                new TypeReference<>() {
                }
        );
        cmd.setEnv(JSONUtils.parseObject(jobDefinitionContentEntity.getEnvConfig(), EnvConfig.class));

        cmd.setWorkflow(workflow != null ? workflow : Collections.emptyMap());
        return cmd;
    }

}
