package org.apache.seatunnel.web.core.job.handler.single;


import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GuideSingleWorkflowAnalyzer {

    private static final Pattern FROM_TABLE_PATTERN = Pattern.compile(
            "(?i)\\bfrom\\s+([`\"]?[\\w.]+[`\"]?)"
    );

    public JobDefinitionAnalysisResult analyze(Object workflowObj) {
        Map<String, Object> workflow = WorkflowNodeHelper.safeMap(workflowObj);

        Map<String, Object> sourceNode = WorkflowNodeHelper.findFirstNodeByType(workflow, "source");
        Map<String, Object> sinkNode = WorkflowNodeHelper.findFirstNodeByType(workflow, "sink");

        return JobDefinitionAnalysisResult.builder()
                .sourceType(extractNodeDbType(sourceNode))
                .sinkType(extractNodeDbType(sinkNode))
                .sourceTable(extractSourceTable(sourceNode))
                .sinkTable(extractSinkTable(sinkNode))
                .build();
    }

    private String extractNodeDbType(Map<String, Object> node) {
        if (node == null || node.isEmpty()) {
            return "";
        }

        Map<String, Object> data = WorkflowNodeHelper.safeMap(node.get("data"));
        Map<String, Object> config = WorkflowNodeHelper.safeMap(data.get("config"));

        String dbType = WorkflowNodeHelper.getString(data, "dbType");
        if (!dbType.isEmpty()) {
            return dbType;
        }

        return WorkflowNodeHelper.getString(config, "dbType");
    }

    private String extractSourceTable(Map<String, Object> sourceNode) {
        if (sourceNode == null || sourceNode.isEmpty()) {
            return "";
        }

        Map<String, Object> data = WorkflowNodeHelper.safeMap(sourceNode.get("data"));
        Map<String, Object> config = WorkflowNodeHelper.safeMap(data.get("config"));

        String sourceTable = WorkflowNodeHelper.firstNonBlank(
                WorkflowNodeHelper.getString(config, "sourceTable"),
                WorkflowNodeHelper.getString(data, "sourceTable")
        );
        if (!sourceTable.isEmpty()) {
            return sourceTable;
        }

        String sql = WorkflowNodeHelper.firstNonBlank(
                WorkflowNodeHelper.getString(config, "sql"),
                WorkflowNodeHelper.getString(data, "sql")
        );
        return parseTableFromSql(sql);
    }

    private String extractSinkTable(Map<String, Object> sinkNode) {
        if (sinkNode == null || sinkNode.isEmpty()) {
            return "";
        }

        Map<String, Object> data = WorkflowNodeHelper.safeMap(sinkNode.get("data"));
        Map<String, Object> config = WorkflowNodeHelper.safeMap(data.get("config"));

        String sinkTable = WorkflowNodeHelper.firstNonBlank(
                WorkflowNodeHelper.getString(data, "sinkTableName"),
                WorkflowNodeHelper.getString(config, "sinkTableName"),
                WorkflowNodeHelper.getString(data, "table"),
                WorkflowNodeHelper.getString(config, "table"),
                WorkflowNodeHelper.getString(data, "targetTable"),
                WorkflowNodeHelper.getString(config, "targetTable")
        );
        if (!sinkTable.isEmpty()) {
            return sinkTable;
        }

        String sinkSql = WorkflowNodeHelper.firstNonBlank(
                WorkflowNodeHelper.getString(data, "sinkSql"),
                WorkflowNodeHelper.getString(config, "sinkSql"),
                WorkflowNodeHelper.getString(data, "sql"),
                WorkflowNodeHelper.getString(config, "sql")
        );
        return parseTableFromSql(sinkSql);
    }

    private String parseTableFromSql(String sql) {
        if (sql == null || sql.trim().isEmpty()) {
            return "";
        }

        try {
            String normalizedSql = sql
                    .replaceAll("[\\r\\n\\t]+", " ")
                    .replaceAll("\\s+", " ")
                    .trim();

            Matcher matcher = FROM_TABLE_PATTERN.matcher(normalizedSql);
            if (matcher.find()) {
                return cleanIdentifier(matcher.group(1));
            }
        } catch (Exception ignored) {
        }

        return "";
    }

    private String cleanIdentifier(String value) {
        String result = WorkflowNodeHelper.safeTrim(value);
        if (result.isEmpty()) {
            return "";
        }

        if ((result.startsWith("`") && result.endsWith("`"))
                || (result.startsWith("\"") && result.endsWith("\""))) {
            result = result.substring(1, result.length() - 1);
        }

        return result.trim();
    }
}
