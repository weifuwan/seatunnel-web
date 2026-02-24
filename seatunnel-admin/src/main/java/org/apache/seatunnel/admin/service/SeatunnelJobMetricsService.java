package org.apache.seatunnel.admin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import lombok.NonNull;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.communal.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.communal.bean.vo.OverviewSummaryVO;
import org.apache.seatunnel.communal.enums.TimeRange;

import java.util.List;
import java.util.Map;

/**
 * Service interface for managing and querying Seatunnel job metrics.
 * <p>
 * This service provides methods to retrieve runtime metrics
 * reported by the execution engine for a specific job.
 */
public interface SeatunnelJobMetricsService extends IService<SeatunnelJobMetricsPO> {

    /**
     * Retrieve job metrics from the execution engine and return them as a map.
     *
     * @param jobEngineId the unique job identifier in the execution engine
     * @return a map of job metrics, keyed by metric type or identifier
     */
    Map<Integer, SeatunnelJobMetricsPO> getJobMetricsFromEngineMap(
            @NonNull String jobEngineId);


    /**
     * Save a batch of job metrics to the database.
     *
     * @param metricsList list of SeatunnelJobMetricsPO to save
     * @return true if all records are saved successfully
     */
    void saveMetricsBatch(@NonNull List<SeatunnelJobMetricsPO> metricsList);

    OverviewSummaryVO summary(TimeRange timeRange, String taskType);

    OverviewChartsVO charts(TimeRange timeRange, String taskType);
}
