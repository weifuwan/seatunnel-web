package org.apache.seatunnel.web.core.job.handler.multi;

import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.config.GuideMultiJobContent;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GuideMultiJobAnalyzer {

    private final GuideMultiTableMatchResolver tableMatchResolver;

    public GuideMultiJobAnalyzer(GuideMultiTableMatchResolver tableMatchResolver) {
        this.tableMatchResolver = tableMatchResolver;
    }

    public JobDefinitionAnalysisResult analyze(GuideMultiJobContent content) {
        List<String> sourceTables = tableMatchResolver.resolveSourceTables(content);
        List<String> sinkTables = tableMatchResolver.resolveSinkTables(content);

        return JobDefinitionAnalysisResult.builder()
                .sourceType(resolveSourceType(content))
                .sinkType(resolveSinkType(content))
                .sourceDatasourceId(resolveSourceDatasourceId(content))
                .sinkDatasourceId(resolveSinkDatasourceId(content))
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

    private Long resolveSourceDatasourceId(GuideMultiJobContent content) {
        if (content == null || content.getSource() == null) {
            return null;
        }
        return parseLong(content.getSource().getDatasourceId());
    }

    private Long resolveSinkDatasourceId(GuideMultiJobContent content) {
        if (content == null || content.getTarget() == null) {
            return null;
        }
        return parseLong(content.getTarget().getDatasourceId());
    }

    private Long parseLong(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}