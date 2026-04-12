package org.apache.seatunnel.web.core.job.handler.single;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.GuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionEditDTO;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

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

    @Override
    public void fillEditDTO(String definitionContent, JobDefinitionEditDTO dto) {
        if (StringUtils.isBlank(definitionContent) || dto == null) {
            return;
        }

        ObjectNode root = JSONUtils.parseObject(definitionContent);
        if (root == null) {
            dto.setWorkflow(Collections.emptyMap());
            return;
        }

        JsonNode workflowNode = root.get("workflow");
        if (workflowNode == null || workflowNode.isNull() || !workflowNode.isObject()) {
            dto.setWorkflow(Collections.emptyMap());
            return;
        }

        Map<String, Object> workflow = JSONUtils.parseObject(
                workflowNode.toString(),
                new TypeReference<Map<String, Object>>() {
                }
        );
        dto.setWorkflow(workflow != null ? workflow : Collections.emptyMap());
    }
}
