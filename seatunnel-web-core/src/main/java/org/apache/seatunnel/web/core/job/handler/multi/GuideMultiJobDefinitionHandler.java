package org.apache.seatunnel.web.core.job.handler.multi;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobScheduleConfig;
import org.springframework.stereotype.Component;

@Component
public class GuideMultiJobDefinitionHandler implements JobDefinitionModeHandler {

    private final GuideMultiJobValidator validator;
    private final GuideMultiJobAnalyzer analyzer;
    private final GuideMultiHoconBuildService hoconBuildService;

    public GuideMultiJobDefinitionHandler(
            GuideMultiJobValidator validator,
            GuideMultiJobAnalyzer analyzer,
            GuideMultiHoconBuildService hoconBuildService) {
        this.validator = validator;
        this.analyzer = analyzer;
        this.hoconBuildService = hoconBuildService;
    }

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.GUIDE_MULTI == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = cast(command);
        validator.validate(cmd);
    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = cast(command);
        return analyzer.analyze(cmd);
    }

    @Override
    public String serializeDefinition(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = cast(command);
        return JSONUtils.toJsonString(cmd.getContent());
    }

    @Override
    public String buildHoconConfig(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = cast(command);
        return hoconBuildService.build(cmd);
    }

    @Override
    public JobDefinitionSaveCommand buildEditCommand(
            JobDefinitionEntity definition,
            String definitionContent,
            JobScheduleConfig scheduleConfig) {

        GuideMultiJobSaveCommand cmd = new GuideMultiJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setSchedule(scheduleConfig);
        cmd.setContent(JSONUtils.parseObject(definitionContent, GuideMultiJobContent.class));

        return cmd;
    }

    private GuideMultiJobSaveCommand cast(JobDefinitionSaveCommand command) {
        if (!(command instanceof GuideMultiJobSaveCommand)) {
            throw new IllegalArgumentException("command must be GuideMultiJobSaveCommand");
        }
        return (GuideMultiJobSaveCommand) command;
    }
}