package org.apache.seatunnel.web.api.service.domain.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobDefinitionAnalysisResult {

    /**
     * Resolved source types, e.g. MYSQL
     */
    private String sourceType;

    /**
     * Resolved sink types, e.g. HIVE
     */
    private String sinkType;

    /**
     * Source table map json
     */
    private String sourceTableJson;

    /**
     * Sink table map json
     */
    private String sinkTableJson;

    /**
     * Normalized or validated job definition info
     */
    private String normalizedJobDefinitionInfo;
}