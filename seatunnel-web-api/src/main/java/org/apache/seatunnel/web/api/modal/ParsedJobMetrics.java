package org.apache.seatunnel.web.api.modal;



import lombok.Data;
import org.apache.seatunnel.web.dao.entity.JobMetrics;
import org.apache.seatunnel.web.dao.entity.JobTableMetrics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Parsed metrics snapshot from SeaTunnel Engine.
 *
 * <p>
 * pipelineMetrics: job / pipeline level summary metrics.
 * tableMetrics: source table -> sink table level metrics.
 * </p>
 */
@Data
public class ParsedJobMetrics {

    private Map<Integer, JobMetrics> pipelineMetrics = new ConcurrentHashMap<>();

    private List<JobTableMetrics> tableMetrics = new ArrayList<>();

    public boolean isEmpty() {
        return (pipelineMetrics == null || pipelineMetrics.isEmpty())
                && (tableMetrics == null || tableMetrics.isEmpty());
    }
}
