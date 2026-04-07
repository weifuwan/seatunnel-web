package org.apache.seatunnel.web.core.verify.executor;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJob;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
public class DefaultSeaTunnelTestJobExecutor implements SeaTunnelTestJobExecutor {

    private static final Set<JobStatus> VERIFY_SUCCESS_STATUSES = Collections.unmodifiableSet(
            new HashSet<JobStatus>(Arrays.asList(
                    JobStatus.RUNNING,
                    JobStatus.FINISHED,
                    JobStatus.SAVEPOINT_DONE
            ))
    );

    private static final Set<JobStatus> VERIFY_FAIL_STATUSES = Collections.unmodifiableSet(
            new HashSet<JobStatus>(Arrays.asList(
                    JobStatus.FAILED,
                    JobStatus.CANCELED,
                    JobStatus.UNKNOWABLE
            ))
    );

    private static final Set<JobStatus> ACTIVE_STATUSES = Collections.unmodifiableSet(
            new HashSet<JobStatus>(Arrays.asList(
                    JobStatus.INITIALIZING,
                    JobStatus.CREATED,
                    JobStatus.PENDING,
                    JobStatus.SCHEDULED,
                    JobStatus.RUNNING,
                    JobStatus.FAILING,
                    JobStatus.DOING_SAVEPOINT,
                    JobStatus.CANCELING
            ))
    );

    @Resource
    private SeaTunnelRestClient seaTunnelRestClient;

    @Override
    public JobExecutionResult executeAndWait(
            SeaTunnelClient client,
            ConnectivityTestJob job,
            long timeoutMs,
            long pollIntervalMs) {

        long start = System.currentTimeMillis();
        Long jobId = null;
        JobExecutionResult result = new JobExecutionResult();

        try {
            Map submitResponse = seaTunnelRestClient.submitJobText(
                    client.getId(),
                    job.getJobConfig(),
                    job.getConfigFormat(),
                    null,
                    job.getJobName(),
                    false
            );

            jobId = extractJobId(submitResponse);
            result.setJobId(jobId);

            if (jobId == null) {
                result.setSuccess(false);
                result.setFinalStatus("SUBMIT_FAILED");
                result.setErrorMessage("Failed to extract jobId from submit response");
                result.setDurationMs(System.currentTimeMillis() - start);
                return result;
            }

            JobStatus observedStatus = waitForVerificationPhase(
                    client.getId(),
                    jobId,
                    timeoutMs,
                    pollIntervalMs
            );

            result.setFinalStatus(observedStatus == null ? "TIMEOUT" : observedStatus.name());

            if (observedStatus == null) {
                result.setSuccess(false);
                result.setErrorMessage("The test job did not reach a verifiable state within the timeout");
                result.setDurationMs(System.currentTimeMillis() - start);

                if (job.isCleanupRequired()) {
                    tryCleanupAndWaitTerminal(client.getId(), jobId, pollIntervalMs, timeoutMs / 2);
                }
                return result;
            }

            if (VERIFY_FAIL_STATUSES.contains(observedStatus)) {
                result.setSuccess(false);
                result.setRawLog(tryReadLog(client.getId(), jobId));
                result.setDurationMs(System.currentTimeMillis() - start);
                return result;
            }

            if (VERIFY_SUCCESS_STATUSES.contains(observedStatus)) {
                if (job.isCleanupRequired() && ACTIVE_STATUSES.contains(observedStatus)) {
                    stopJobQuietly(client.getId(), jobId);
                    JobStatus terminalStatus = waitForTerminalAfterStop(
                            client.getId(),
                            jobId,
                            timeoutMs / 2,
                            pollIntervalMs
                    );
                    if (terminalStatus != null) {
                        result.setFinalStatus(terminalStatus.name());
                    } else {
                        result.setFinalStatus("STOPPING_TIMEOUT");
                    }
                }

                result.setSuccess(true);
                result.setDurationMs(System.currentTimeMillis() - start);
                return result;
            }

            result.setSuccess(false);
            result.setErrorMessage("Unexpected job status: " + observedStatus.name());
            result.setDurationMs(System.currentTimeMillis() - start);
            return result;

        } catch (Exception e) {
            log.error("Execute connectivity test job failed: clientId={}, jobId={}, jobName={}",
                    client.getId(), jobId, job.getJobName(), e);

            result.setSuccess(false);
            result.setErrorMessage(simplifyMessage(e));
            result.setDurationMs(System.currentTimeMillis() - start);

            if (jobId != null && job.isCleanupRequired()) {
                tryCleanupAndWaitTerminal(client.getId(), jobId, pollIntervalMs, timeoutMs / 2);
            }
            return result;
        }
    }

    private JobStatus waitForVerificationPhase(
            Long clientId,
            Long jobId,
            long timeoutMs,
            long pollIntervalMs) throws InterruptedException {

        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            JobStatus status = queryJobStatus(clientId, jobId);
            if (status != null) {
                if (VERIFY_SUCCESS_STATUSES.contains(status) || VERIFY_FAIL_STATUSES.contains(status)) {
                    return status;
                }
            }
            Thread.sleep(pollIntervalMs);
        }
        return null;
    }

    private JobStatus waitForTerminalAfterStop(
            Long clientId,
            Long jobId,
            long timeoutMs,
            long pollIntervalMs) throws InterruptedException {

        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            JobStatus status = queryJobStatus(clientId, jobId);
            if (status != null && status.isEndState()) {
                return status;
            }
            Thread.sleep(pollIntervalMs);
        }
        return null;
    }

    private void tryCleanupAndWaitTerminal(
            Long clientId,
            Long jobId,
            long pollIntervalMs,
            long timeoutMs) {
        if (jobId == null) {
            return;
        }

        try {
            stopJobQuietly(clientId, jobId);
            waitForTerminalAfterStop(clientId, jobId, timeoutMs, pollIntervalMs);
        } catch (Exception e) {
            log.warn("Cleanup connectivity test job failed: clientId={}, jobId={}", clientId, jobId, e);
        }
    }

    private JobStatus queryJobStatus(Long clientId, Long jobId) {
        try {
            Map info = seaTunnelRestClient.jobInfo(clientId, jobId);
            JobStatus status = extractStatus(info);
            if (status != null) {
                return status;
            }
        } catch (Exception ignored) {
        }

        try {
            List running = seaTunnelRestClient.runningJobs(clientId);
            if (containsJob(running, jobId)) {
                return JobStatus.RUNNING;
            }
        } catch (Exception ignored) {
        }

        try {
            List finished = seaTunnelRestClient.finishedJobs(clientId, "FINISHED");
            if (containsJob(finished, jobId)) {
                return JobStatus.FINISHED;
            }
        } catch (Exception ignored) {
        }

        try {
            List failed = seaTunnelRestClient.finishedJobs(clientId, "FAILED");
            if (containsJob(failed, jobId)) {
                return JobStatus.FAILED;
            }
        } catch (Exception ignored) {
        }

        try {
            List canceled = seaTunnelRestClient.finishedJobs(clientId, "CANCELED");
            if (containsJob(canceled, jobId)) {
                return JobStatus.CANCELED;
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private void stopJobQuietly(Long clientId, Long jobId) {
        if (jobId == null) {
            return;
        }
        try {
            seaTunnelRestClient.stopJob(clientId, jobId, false);
            log.info("Stop requested for test job: clientId={}, jobId={}", clientId, jobId);
        } catch (Exception e) {
            log.warn("Stop test job failed: clientId={}, jobId={}", clientId, jobId, e);
        }
    }

    private String tryReadLog(Long clientId, Long jobId) {
        try {
            Object logObj = seaTunnelRestClient.logs(clientId, jobId, "TEXT");
            return logObj == null ? null : String.valueOf(logObj);
        } catch (Exception e) {
            log.warn("Read test job log failed: clientId={}, jobId={}", clientId, jobId, e);
            return null;
        }
    }

    private Long extractJobId(Map submitResponse) {
        if (submitResponse == null || submitResponse.isEmpty()) {
            return null;
        }

        Object direct = firstNonNull(
                submitResponse.get("jobId"),
                submitResponse.get("job_id"),
                submitResponse.get("id")
        );
        Long parsedDirect = toLong(direct);
        if (parsedDirect != null) {
            return parsedDirect;
        }

        Object data = submitResponse.get("data");
        if (data instanceof Map) {
            Map dataMap = (Map) data;
            Object nested = firstNonNull(
                    dataMap.get("jobId"),
                    dataMap.get("job_id"),
                    dataMap.get("id")
            );
            return toLong(nested);
        }

        return null;
    }

    private JobStatus extractStatus(Map info) {
        if (info == null || info.isEmpty()) {
            return null;
        }

        Object direct = firstNonNull(
                info.get("status"),
                info.get("jobStatus"),
                info.get("state")
        );
        JobStatus directStatus = toJobStatus(direct);
        if (directStatus != null) {
            return directStatus;
        }

        Object data = info.get("data");
        if (data instanceof Map) {
            Map dataMap = (Map) data;
            Object nested = firstNonNull(
                    dataMap.get("status"),
                    dataMap.get("jobStatus"),
                    dataMap.get("state")
            );
            return toJobStatus(nested);
        }

        return null;
    }

    private boolean containsJob(List list, Long jobId) {
        if (list == null || list.isEmpty() || jobId == null) {
            return false;
        }

        for (Object item : list) {
            if (item instanceof Map) {
                Map map = (Map) item;
                Long id = toLong(firstNonNull(map.get("jobId"), map.get("job_id"), map.get("id")));
                if (jobId.equals(id)) {
                    return true;
                }
            }
        }
        return false;
    }

    private JobStatus toJobStatus(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return JobStatus.fromString(String.valueOf(value));
        } catch (Exception ignored) {
            return null;
        }
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
    }

    private Object firstNonNull(Object... values) {
        if (values == null) {
            return null;
        }

        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String simplifyMessage(Throwable e) {
        String msg = e.getMessage();
        if (msg == null || msg.trim().isEmpty()) {
            return e.getClass().getSimpleName();
        }
        return msg;
    }
}
