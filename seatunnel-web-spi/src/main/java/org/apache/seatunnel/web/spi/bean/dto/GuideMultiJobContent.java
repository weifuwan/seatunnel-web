package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GuideMultiJobContent {

    private MultiSourceConfig source;

    private MultiSinkConfig sink;

    private List<TableSyncItem> tableItems;

    private MultiSyncRule syncRule;

    @Data
    public static class MultiSourceConfig {
        private String dataSourceId;
        private String dbType;
        private List<Map<String, Object>> extraParams;
    }

    @Data
    public static class MultiSinkConfig {
        private String dataSourceId;
        private String dbType;
        private String writeMode;
        private Boolean autoCreateTable;
        private List<Map<String, Object>> extraParams;
    }

    @Data
    public static class TableSyncItem {
        private String sourceTable;
        private String sinkTable;
        private String primaryKey;
        private String whereClause;
        private String writeMode;
        private Boolean autoCreateTable;
        private List<FieldMapping> fieldMappings;
    }

    @Data
    public static class FieldMapping {
        private String sourceFieldName;
        private String sinkFieldName;
    }

    @Data
    public static class MultiSyncRule {
        private String tableMatchStrategy;
        private String conflictStrategy;
        private String namingStrategy;
    }
}
