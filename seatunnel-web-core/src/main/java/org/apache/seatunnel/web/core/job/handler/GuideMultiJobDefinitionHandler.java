package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionEditDTO;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class GuideMultiJobDefinitionHandler implements JobDefinitionModeHandler {

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.GUIDE_MULTI == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = (GuideMultiJobSaveCommand) command;

    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        return new JobDefinitionAnalysisResult();
    }

    @Override
    public String serializeDefinition(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = (GuideMultiJobSaveCommand) command;
        return JSONUtils.toJsonString(cmd.getContent());
    }

    @Override
    public String buildHoconConfig(JobDefinitionSaveCommand command) {
        return "TODO build guide multi hocon";
    }

    @Override
    public void fillEditDTO(String definitionContent, JobDefinitionEditDTO dto) {

    }
}
