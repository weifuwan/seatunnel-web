package org.apache.seatunnel.web.api.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.BatchJobInstanceService;
import org.apache.seatunnel.web.api.utils.JobUtils;
import org.apache.seatunnel.web.common.enums.JobResult;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
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

    private final ZetaLogSnapshotService zetaLogSnapshotService;

    public JobResultHandler(BatchJobInstanceService instanceService,
                            JobMetricsMonitor jobMetricsMonitor,
                            ZetaLogSnapshotService zetaLogSnapshotService) {
        this.instanceService = instanceService;
        this.jobMetricsMonitor = jobMetricsMonitor;
        this.zetaLogSnapshotService = zetaLogSnapshotService;
    }

    /**
     * Handle successful job completion.
     *
     * @param jobInstanceId job instance identifier
     */
    public void handleSuccess(Long jobInstanceId) {
        updateStatus(jobInstanceId, JobStatus.FINISHED, null, false);
        log.info("Job completed successfully. instanceId={}", jobInstanceId);
    }

    /**
     * Handle job failure caused by an exception.
     *
     * @param jobInstanceId job instance identifier
     * @param error         failure exception
     */
    public void handleFailure(Long jobInstanceId, Throwable error) {
        String message = error == null
                ? "Unknown error"
                : JobUtils.getJobInstanceErrorMessage(error.getMessage());

        updateStatus(jobInstanceId, JobStatus.FAILED, message, true);

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

        updateStatus(jobInstanceId, JobStatus.FAILED, message, true);

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
     * @param jobInstanceId    job instance identifier
     * @param status           final job status
     * @param errorMessage     error message
     * @param appendFailureLog whether to append Zeta failure log snapshot
     */
    private void updateStatus(Long jobInstanceId,
                              JobStatus status,
                              String errorMessage,
                              boolean appendFailureLog) {
        JobInstanceVO current = null;

        if (appendFailureLog) {
            current = queryInstanceQuietly(jobInstanceId);
        }

        JobInstance po = new JobInstance();
        po.setId(jobInstanceId);
        po.setJobStatus(status);
        po.setEndTime(new Date());
        po.setErrorMessage(errorMessage);

        instanceService.updateById(po);

        if (appendFailureLog) {
            appendZetaFailureSnapshot(jobInstanceId, current);
        }

        jobMetricsMonitor.finalizeAndPersist(jobInstanceId);
    }

    private JobInstanceVO queryInstanceQuietly(Long jobInstanceId) {
        try {
            return instanceService.selectById(jobInstanceId);
        } catch (Exception e) {
            log.warn("Query job instance failed, instanceId={}", jobInstanceId, e);
            return null;
        }
    }

    private void appendZetaFailureSnapshot(Long jobInstanceId, JobInstanceVO current) {
        try {
            if (current == null) {
                current = queryInstanceQuietly(jobInstanceId);
            }

            if (current == null) {
                log.warn("Skip Zeta failure log snapshot because job instance not found, instanceId={}", jobInstanceId);
                return;
            }

            String logPath = current.getLogPath();
            Long engineId = current.getEngineJobId();

            zetaLogSnapshotService.appendFailureSnapshot(logPath, jobInstanceId, engineId);

        } catch (Exception e) {
            log.warn("Append Zeta failure log snapshot failed, instanceId={}", jobInstanceId, e);
        }
    }
}