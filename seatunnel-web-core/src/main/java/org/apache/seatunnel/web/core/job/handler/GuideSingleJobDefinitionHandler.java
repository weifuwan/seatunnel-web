package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.GuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class GuideSingleJobDefinitionHandler implements JobDefinitionModeHandler {

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.GUIDE_SINGLE == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;
        if (cmd.getContent() == null) {
            throw new IllegalArgumentException("content can not be null");
        }
        if (cmd.getContent().getSource() == null) {
            throw new IllegalArgumentException("source can not be null");
        }
        if (cmd.getContent().getSink() == null) {
            throw new IllegalArgumentException("sink can not be null");
        }
    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;

        String sourceType = cmd.getContent().getSource().getDbType();
        String sinkType = cmd.getContent().getSink().getDbType();
        String sourceTable = cmd.getContent().getSource().getSourceTable();
        String sinkTable = cmd.getContent().getSink().getSinkTableName();

        return JobDefinitionAnalysisResult.builder()
                .sourceType(sourceType)
                .sinkType(sinkType)
                .sourceTableJson(sourceTable)
                .sinkTableJson(sinkTable)
                .build();
    }

    @Override
    public String serializeDefinition(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;
        return JSONUtils.toJsonString(cmd.getContent());
    }

    @Override
    public String buildHoconConfig(JobDefinitionSaveCommand command) {
        GuideSingleJobSaveCommand cmd = (GuideSingleJobSaveCommand) command;

        // 这里直接按 source / mapping / transform / sink 去拼 HOCON
        // 不再强制先转成旧版 DAG JSON
        return "TODO build guide single hocon";
    }
}
