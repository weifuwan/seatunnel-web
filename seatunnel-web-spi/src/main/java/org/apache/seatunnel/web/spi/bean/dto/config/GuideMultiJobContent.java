package org.apache.seatunnel.web.spi.bean.dto.config;

import lombok.Data;

import java.util.List;

@Data
public class GuideMultiJobContent {

    /**
     * 对齐前端 content.source
     */
    private WorkflowSourceConfig source;

    /**
     * 对齐前端 content.target
     */
    private WorkflowTargetConfig target;

    /**
     * 对齐前端 content.tableMatch
     */
    private TableMatchConfig tableMatch;

    @Data
    public static class WorkflowSourceConfig {
        private String dbType;
        private String connectorType;
        private String datasourceId;
        private String pluginName;
        private Integer fetchSize;
        private Integer splitSize;
    }

    @Data
    public static class WorkflowTargetConfig {
        private String dbType;
        private String connectorType;
        private String datasourceId;
        private String pluginName;
        private String dataSaveMode;
        private Integer batchSize;
        private String schemaSaveMode;
        private Boolean enableUpsert;
        private String fieldIde;
    }

    @Data
    public static class TableMatchConfig {
        /**
         * 前端当前是 "1" / "2" / "3" / "4"
         */
        private String mode;

        /**
         * matchMode 为 1/4 时使用
         */
        private List<String> tables;

        /**
         * matchMode 为 2/3 时使用
         */
        private String keyword;
    }
}