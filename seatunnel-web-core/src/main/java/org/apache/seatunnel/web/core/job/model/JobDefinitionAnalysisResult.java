package org.apache.seatunnel.web.core.job.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
    private String sourceTable;

    /**
     * Sink table map json
     */
    private String sinkTable;

}