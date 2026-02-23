package org.apache.seatunnel.admin.thirdparty.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.utils.JobUtils;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.engine.common.job.JobResult;
import org.apache.seatunnel.engine.common.job.JobStatus;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * Handler responsible for processing SeaTunnel job execution results
 * and updating job instance status in the database.
 *
 * <p>
 * This class centralizes success and failure handling logic
 * to ensure consistent job status updates and logging.
 * </p>
 */
@Component
@Slf4j
public class JobResultHandler {

    /**
     * Service for operating on job instance persistence layer.
     */
    private final SeatunnelJobInstanceService instanceService;
    private final JobMetricsMonitor jobMetricsMonitor;

    public JobResultHandler(SeatunnelJobInstanceService instanceService, JobMetricsMonitor jobMetricsMonitor) {
        this.instanceService = instanceService;
        this.jobMetricsMonitor = jobMetricsMonitor;
    }

    /**
     * Handle successful job completion.
     *
     * @param jobInstanceId job instance identifier
     */
    public void handleSuccess(Long jobInstanceId) {
        updateStatus(jobInstanceId, JobStatus.FINISHED, null);
        log.info("Job completed successfully. instanceId={}", jobInstanceId);
    }

    /**
     * Handle job failure caused by an exception.
     *
     * @param jobInstanceId job instance identifier
     * @param error         failure exception
     */
    public void handleFailure(Long jobInstanceId, Throwable error) {
        // Extract and normalize error message for persistence
        String message = JobUtils.getJobInstanceErrorMessage(error.getMessage());

        updateStatus(jobInstanceId, JobStatus.FAILED, message);
        log.error("Job failed. instanceId={}, error={}", jobInstanceId, message, error);
    }

    /**
     * Handle job failure based on engine job result.
     *
     * @param jobInstanceId job instance identifier
     * @param jobResult     job execution result returned by engine
     */
    public void handleFailure(Long jobInstanceId, JobResult jobResult) {
        String message = jobResult != null ? jobResult.getError() : "Unknown error";

        updateStatus(jobInstanceId, JobStatus.FAILED, message);
        log.error(
                "Job failed. instanceId={}, status={}, error={}",
                jobInstanceId,
                jobResult != null ? jobResult.getStatus() : "null",
                message
        );
    }

    /**
     * Update engine job ID after successful job submission.
     *
     * @param instanceId job instance identifier
     * @param engineId   engine-generated job ID
     */
    public void updateEngineId(Long instanceId, String engineId) {
        SeatunnelJobInstancePO po = new SeatunnelJobInstancePO();
        po.setId(instanceId);
        po.setJobEngineId(engineId);

        instanceService.updateById(po);
        log.info("Job submitted. instanceId={}, engineId={}", instanceId, engineId);
    }

    /**
     * Update job instance status, end time, and error message.
     *
     * <p>
     * This method is shared by success and failure handlers to ensure
     * consistent status persistence.
     * </p>
     *
     * @param jobInstanceId job instance identifier
     * @param status        final job status
     * @param errorMessage  error message (null for success)
     */
    private void updateStatus(Long jobInstanceId, JobStatus status, String errorMessage) {
        SeatunnelJobInstancePO po = new SeatunnelJobInstancePO();
        po.setId(jobInstanceId);
        po.setJobStatus(status.toString());
        po.setEndTime(new Date());
        po.setErrorMessage(errorMessage);

        instanceService.updateById(po);
        jobMetricsMonitor.finalizeAndPersist(jobInstanceId);
    }
}
