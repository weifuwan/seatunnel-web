package org.apache.seatunnel.web.core.job.handler;

import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.*;
import org.springframework.stereotype.Component;

@Component
public class ScriptJobDefinitionHandler implements JobDefinitionModeHandler {

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.SCRIPT == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        ScriptJobSaveCommand cmd = (ScriptJobSaveCommand) command;
        if (cmd.getContent() == null || StringUtils.isBlank(cmd.getContent().getHoconContent())) {
            throw new IllegalArgumentException("scriptText can not be blank");
        }
    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        ScriptJobSaveCommand cmd = (ScriptJobSaveCommand) command;


        return JobDefinitionAnalysisResult.builder()
                .sourceType("SCRIPT_SOURCE")
                .sinkType("SCRIPT_SINK")
                .sourceTable(null)
                .sinkTable(null)
                .build();
    }

    @Override
    public String serializeDefinition(JobDefinitionSaveCommand command) {
        ScriptJobSaveCommand cmd = (ScriptJobSaveCommand) command;
        return JSONUtils.toJsonString(cmd.getContent());
    }

    @Override
    public String buildHoconConfig(JobDefinitionSaveCommand command) {
        ScriptJobSaveCommand cmd = (ScriptJobSaveCommand) command;
        return cmd.getContent().getHoconContent();
    }

    @Override
    public JobDefinitionSaveCommand buildEditCommand(
            JobDefinitionEntity definition,
            String definitionContent,
            JobScheduleConfig scheduleConfig) {

        ScriptJobSaveCommand cmd = new ScriptJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setSchedule(scheduleConfig);
        cmd.setContent(JSONUtils.parseObject(definitionContent, ScriptJobContent.class));
        return cmd;
    }
}
