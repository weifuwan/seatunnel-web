package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionEditDTO;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GuideMultiJobDefinitionHandler implements JobDefinitionModeHandler {

    @Override
    public boolean supports(JobDefinitionMode mode) {
        return JobDefinitionMode.GUIDE_MULTI == mode;
    }

    @Override
    public void validate(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = (GuideMultiJobSaveCommand) command;
        if (cmd.getContent() == null || cmd.getContent().getTableItems() == null || cmd.getContent().getTableItems().isEmpty()) {
            throw new IllegalArgumentException("tableItems can not be empty");
        }
    }

    @Override
    public JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command) {
        GuideMultiJobSaveCommand cmd = (GuideMultiJobSaveCommand) command;

        String sourceType = cmd.getContent().getSource() == null ? null : cmd.getContent().getSource().getDbType();
        String sinkType = cmd.getContent().getSink() == null ? null : cmd.getContent().getSink().getDbType();

        List<String> sourceTables = cmd.getContent().getTableItems().stream()
                .map(GuideMultiJobContent.TableSyncItem::getSourceTable)
                .toList();

        List<String> sinkTables = cmd.getContent().getTableItems().stream()
                .map(GuideMultiJobContent.TableSyncItem::getSinkTable)
                .toList();

        return JobDefinitionAnalysisResult.builder()
                .sourceType(sourceType)
                .sinkType(sinkType)
                .sourceTable(JSONUtils.toJsonString(sourceTables))
                .sourceTable(JSONUtils.toJsonString(sinkTables))
                .build();
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
