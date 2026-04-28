package org.apache.seatunnel.web.api.metrics;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.common.enums.JobResult;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Watch SeaTunnel job result by REST polling.
 */
@Component
@Slf4j
public class JobResultWatcher {

    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Resource
    private JobMetricsMonitor metricsMonitor;

    @Resource
    private JobResultHandler resultHandler;

    @Resource
    private SeaTunnelRestClient seatunnelRestClient;

    @Value("${seatunnel.result.poll-interval-ms:2000}")
    private long pollIntervalMs;

    @Value("${seatunnel.result.poll-timeout-ms:0}")
    private long pollTimeoutMs;

    public void registerByRest(JobRuntimeContext context) {
        executor.submit(() -> watch(context));
    }

    private void watch(JobRuntimeContext context) {
        long start = System.currentTimeMillis();

        Long instanceId = context.getInstanceId();
        Long engineId = context.getEngineId();

        try {
            while (true) {
                checkTimeout(start, engineId);

                Map jobInfo = seatunnelRestClient.jobInfo(context.getClientId(), engineId);
                String statusStr = readStatus(jobInfo);

                if (statusStr == null) {
                    log.warn("job-info returned no status, engineId={}, resp={}", engineId, jobInfo);
                    sleepQuietly();
                    continue;
                }

                JobStatus status = parseJobStatus(statusStr);

                if (status == JobStatus.RUNNING) {
                    sleepQuietly();
                    continue;
                }

                handleFinalStatus(instanceId, status, jobInfo);

                return;
            }
        } catch (Exception e) {
            log.warn("REST job result watcher failed, instanceId={}, engineId={}",
                    instanceId, engineId, e);

            resultHandler.handleFailure(instanceId, e);

            try {
                metricsMonitor.finalizeAndPersist(instanceId, "FAILED");
            } catch (Exception ignored) {
            }
        } finally {
            log.info("REST job result watcher finished, instanceId={}, engineId={}",
                    instanceId, engineId);
        }
    }

    private void handleFinalStatus(Long instanceId,
                                   JobStatus status,
                                   Map jobInfo) {
        if (status == JobStatus.FINISHED) {
            resultHandler.handleSuccess(instanceId);
            metricsMonitor.finalizeAndPersist(instanceId, "FINISHED");
            return;
        }

        JobResult jr = new JobResult(JobStatus.FAILED);
        jr.setStatus(status);
        jr.setError(readErrorMsg(jobInfo));

        resultHandler.handleFailure(instanceId, jr);
        metricsMonitor.finalizeAndPersist(instanceId, status.name());
    }

    private void checkTimeout(long start, Long engineId) {
        if (pollTimeoutMs <= 0) {
            return;
        }

        long cost = System.currentTimeMillis() - start;
        if (cost > pollTimeoutMs) {
            throw new IllegalStateException("Polling job-info timeout, engineId=" + engineId);
        }
    }

    private String readStatus(Map jobInfo) {
        if (jobInfo == null) {
            return null;
        }

        Object status = jobInfo.get("jobStatus");
        if (status == null) {
            return null;
        }

        String value = String.valueOf(status);
        if (value.trim().isEmpty() || "null".equalsIgnoreCase(value)) {
            return null;
        }

        return value;
    }

    private String readErrorMsg(Map jobInfo) {
        if (jobInfo == null) {
            return null;
        }

        Object errorMsg = jobInfo.get("errorMsg");
        return errorMsg == null ? null : String.valueOf(errorMsg);
    }

    private void sleepQuietly() throws InterruptedException {
        Thread.sleep(pollIntervalMs);
    }

    private JobStatus parseJobStatus(String value) {
        try {
            return JobStatus.valueOf(value);
        } catch (Exception e) {
            if ("CANCELLED".equalsIgnoreCase(value)) {
                return JobStatus.CANCELED;
            }

            return JobStatus.UNKNOWABLE;
        }
    }
}