package org.apache.seatunnel.web.core.job.handler.multi;

import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GuideMultiJobAnalyzer {

    private final GuideMultiTableMatchResolver tableMatchResolver;

    public GuideMultiJobAnalyzer(GuideMultiTableMatchResolver tableMatchResolver) {
        this.tableMatchResolver = tableMatchResolver;
    }

    public JobDefinitionAnalysisResult analyze(GuideMultiJobSaveCommand command) {
        GuideMultiJobContent content = command.getContent();

        List<String> sourceTables = tableMatchResolver.resolveSourceTables(content);
        List<String> sinkTables = tableMatchResolver.resolveSinkTables(content);

        return JobDefinitionAnalysisResult.builder()
                .sourceType(resolveSourceType(content))
                .sinkType(resolveSinkType(content))
                .sourceTable(JSONUtils.toJsonString(sourceTables))
                .sinkTable(JSONUtils.toJsonString(sinkTables))
                .build();
    }

    private String resolveSourceType(GuideMultiJobContent content) {
        if (content == null || content.getSource() == null) {
            return "";
        }
        return content.getSource().getDbType();
    }

    private String resolveSinkType(GuideMultiJobContent content) {
        if (content == null || content.getTarget() == null) {
            return "";
        }
        return content.getTarget().getDbType();
    }
}