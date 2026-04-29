package org.apache.seatunnel.web.api.service;

import lombok.NonNull;
import org.apache.seatunnel.web.api.modal.ParsedJobMetrics;
import org.apache.seatunnel.web.common.enums.TimeRange;
import org.apache.seatunnel.web.dao.entity.JobMetrics;
import org.apache.seatunnel.web.dao.entity.JobTableMetrics;
import org.apache.seatunnel.web.spi.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.web.spi.bean.vo.OverviewSummaryVO;

import java.util.List;

public interface JobMetricsService {

    /**
     * Fetch and parse metrics from SeaTunnel Engine.
     */
    ParsedJobMetrics getJobMetricsFromEngine(@NonNull Long clientId,
                                             @NonNull Long jobEngineId);

    /**
     * Save pipeline level metrics.
     */
    void saveMetricsBatch(@NonNull List<JobMetrics> metricsList);

    /**
     * Save table level metrics.
     */
    void saveTableMetricsBatch(@NonNull List<JobTableMetrics> metricsList);

    OverviewSummaryVO summary(TimeRange timeRange, String taskType);

    OverviewChartsVO charts(TimeRange timeRange, String taskType);
}