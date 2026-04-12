package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GuideSingleJobContent {

    private SourceConfig source;

    private SinkConfig sink;

    private List<FieldMapping> fieldMappings;

    private List<TransformConfig> transforms;

    @Data
    public static class SourceConfig {
        private String dataSourceId;
        private String dbType;
        private String readMode;      // table / sql
        private String sourceTable;
        private String sql;
        private List<Map<String, Object>> extraParams;
        private List<ColumnMeta> outputSchema;
    }

    @Data
    public static class SinkConfig {
        private String dataSourceId;
        private String dbType;
        private String writeMode;     // append / overwrite / upsert ...
        private String sinkTableName;
        private String sinkSql;
        private String primaryKey;
        private Boolean autoCreateTable;
        private List<Map<String, Object>> extraParams;
        private List<ColumnMeta> inputSchema;
    }

    @Data
    public static class FieldMapping {
        private String sourceFieldName;
        private String sinkFieldName;
        private String sourceType;
        private String sinkType;
    }

    @Data
    public static class TransformConfig {
        private String type;
        private Map<String, Object> config;
    }

    @Data
    public static class ColumnMeta {
        private String originFieldName;
        private String type;
        private String nullable;
        private String comment;
    }
}
