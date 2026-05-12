package org.apache.seatunnel.web.core.job.handler.script;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.ScriptJobContentCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.ScriptJobContent;
import org.springframework.stereotype.Component;

@Component
public class ScriptJobDefinitionHandler implements JobDefinitionModeHandler {

    @Resource
    private ScriptJobDefinitionParser scriptJobDefinitionParser;

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.SCRIPT == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        ScriptJobContentCommand cmd = cast(command);

        ScriptJobContent content = cmd.getContent();
        if (content == null) {
            throw new IllegalArgumentException("content can not be null");
        }
        if (StringUtils.isBlank(content.getHoconContent())) {
            throw new IllegalArgumentException("hoconContent can not be blank");
        }

        Config config = scriptJobDefinitionParser.parseAndValidate(content.getHoconContent());

        if (!config.hasPath("source")) {
            throw new IllegalArgumentException("hocon source can not be empty");
        }
        if (!config.hasPath("sink")) {
            throw new IllegalArgumentException("hocon sink can not be empty");
        }
    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        ScriptJobContentCommand cmd = cast(command);
        return scriptJobDefinitionParser.analyze(cmd.getContent().getHoconContent());
    }

    @Override
    public String serializeDefinition(JobDefinitionSaveCommand command) {
        ScriptJobContentCommand cmd = cast(command);
        return JSONUtils.toJsonString(cmd.getContent());
    }

    @Override
    public String buildHoconConfig(JobDefinitionSaveCommand command) {
        ScriptJobContentCommand cmd = cast(command);
        return cmd.getContent().getHoconContent();
    }

    private ScriptJobContentCommand cast(JobDefinitionSaveCommand command) {
        if (!(command instanceof ScriptJobContentCommand)) {
            throw new IllegalArgumentException("command must implement ScriptJobContentCommand");
        }
        return (ScriptJobContentCommand) command;
    }
}