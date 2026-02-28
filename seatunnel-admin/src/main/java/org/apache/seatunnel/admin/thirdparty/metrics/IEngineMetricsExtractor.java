package org.apache.seatunnel.admin.thirdparty.metrics;

import jakarta.validation.constraints.NotNull;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.engine.common.job.JobStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * Abstraction for extracting real-time job metrics
 * from the SeaTunnel engine cluster.
 *
 * <p>
 * Implementations are responsible for querying engine-side
 * runtime information and converting it into unified
 * {@link SeatunnelJobMetricsPO} objects.
 * </p>
 */
public interface IEngineMetricsExtractor {

    /**
     * Retrieve metrics for all currently running jobs in the engine cluster.
     *
     * <p>
     * The returned map is structured as:
     * </p>
     *
     * <pre>
     * jobInstanceId -> (vertexId -> metrics)
     * </pre>
     *
     * @return map of running job metrics grouped by job instance ID
     */
    Map<Long, HashMap<Integer, SeatunnelJobMetricsPO>> getAllRunningJobMetrics();

    /**
     * Retrieve real-time metrics for a specific job by engine job ID.
     *
     * <p>
     * Metrics are grouped by vertex (task) ID.
     * </p>
     *
     * @param jobEngineId engine-generated job identifier
     * @return map of vertex metrics, keyed by vertex ID
     */
    Map<Integer, SeatunnelJobMetricsPO> getMetricsByJobEngineIdRTMap(String jobEngineId);

    JobStatus getJobStatus(@NotNull String jobEngineId);


}
