package org.apache.seatunnel.web.core.job.handler.single;


import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.GuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class GuideSingleJobDefinitionHandler implements JobDefinitionModeHandler {

    private final GuideSingleWorkflowValidator workflowValidator;
    private final GuideSingleWorkflowAnalyzer workflowAnalyzer;

    public GuideSingleJobDefinitionHandler(
            GuideSingleWorkflowValidator workflowValidator,
            GuideSingleWorkflowAnalyzer workflowAnalyzer) {
        this.workflowValidator = workflowValidator;
        this.workflowAnalyzer = workflowAnalyzer;
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
        return "TODO build guide single hocon";
    }
}
