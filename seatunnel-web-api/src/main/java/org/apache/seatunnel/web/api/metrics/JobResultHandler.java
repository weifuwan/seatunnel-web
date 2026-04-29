package org.apache.seatunnel.web.api.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.BatchJobInstanceService;
import org.apache.seatunnel.web.api.utils.JobUtils;
import org.apache.seatunnel.web.common.enums.JobResult;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.dao.entity.JobInstance;
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
    private final BatchJobInstanceService instanceService;
    private final JobMetricsMonitor jobMetricsMonitor;

    public JobResultHandler(BatchJobInstanceService instanceService, JobMetricsMonitor jobMetricsMonitor) {
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
    public void updateEngineId(Long instanceId, Long engineId) {
        JobInstance po = new JobInstance();
        po.setId(instanceId);
        po.setEngineJobId(engineId);

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
        JobInstance po = new JobInstance();
        po.setId(jobInstanceId);
        po.setJobStatus(status);
        po.setEndTime(new Date());
        po.setErrorMessage(errorMessage);

        instanceService.updateById(po);
        jobMetricsMonitor.finalizeAndPersist(jobInstanceId);
    }
}
