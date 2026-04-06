package org.apache.seatunnel.web.api.verify;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;

@Slf4j
@Component
public class JdbcDatasourceConnectivityVerificationStrategy
        implements DatasourceConnectivityVerificationStrategy {

    private static final Set<DbType> SUPPORTED = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                    DbType.MYSQL,
                    DbType.POSTGRE_SQL,
                    DbType.ORACLE
            ))
    );

    /**
     * Phase 1 success states:
     * RUNNING means the job has actually started and connectivity is very likely established.
     * FINISHED means the test job completed successfully.
     * SAVEPOINT_DONE is treated as a successful terminal fallback.
     */
    private static final Set<JobStatus> VERIFY_SUCCESS_STATUSES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                    JobStatus.RUNNING,
                    JobStatus.FINISHED,
                    JobStatus.SAVEPOINT_DONE
            ))
    );

    /**
     * Phase 1 failure states.
     */
    private static final Set<JobStatus> VERIFY_FAIL_STATUSES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                    JobStatus.FAILED,
                    JobStatus.CANCELED,
                    JobStatus.UNKNOWABLE
            ))
    );

    /**
     * Active states that may still need explicit stop/cleanup.
     */
    private static final Set<JobStatus> ACTIVE_STATUSES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
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
    private JdbcConnectivityTestJobBuilder jobBuilder;

    @Resource
    private SeaTunnelRestClient seaTunnelRestClient;

    @Override
    public boolean supports(DbType dbType) {
        return SUPPORTED.contains(dbType);
    }

    @Override
    public ClientDatasourceVerifyVO verify(
            SeaTunnelClient client,
            DataSource datasource,
            long timeoutMs,
            long pollIntervalMs) {

        long start = System.currentTimeMillis();
        String jobName = buildJobName(client.getId(), datasource.getId());
        String jobConfig = jobBuilder.build(datasource, jobName);

        ClientDatasourceVerifyVO result = baseResult(client, datasource, jobName);

        Long jobId = null;
        JobStatus observedStatus = null;

        try {
            Map submitResponse = seaTunnelRestClient.submitJobText(
                    client.getId(),
                    jobConfig,
                    "hocon",
                    null,
                    jobName,
                    false
            );

            jobId = extractJobId(submitResponse);
            if (jobId == null) {
                result.setSuccess(false);
                result.setMessage("Test job submission failed");
                result.setErrorMessage("Failed to extract jobId from submit response");
                result.setFinalJobStatus("SUBMIT_FAILED");
                result.setDurationMs(System.currentTimeMillis() - start);

                log.warn("Connectivity verification submit failed: clientId={}, datasourceId={}, jobId missing",
                        client.getId(), datasource.getId());
                return result;
            }

            result.setTestJobId(String.valueOf(jobId));

            log.info("Connectivity verification job submitted: clientId={}, datasourceId={}, jobId={}, jobName={}",
                    client.getId(), datasource.getId(), jobId, jobName);

            // Phase 1: wait until the job reaches a verifiable state
            observedStatus = waitForVerificationPhase(
                    client.getId(),
                    jobId,
                    timeoutMs,
                    pollIntervalMs
            );

            result.setFinalJobStatus(observedStatus == null ? "TIMEOUT" : observedStatus.name());

            log.info("Connectivity verification phase completed: clientId={}, datasourceId={}, jobId={}, status={}",
                    client.getId(), datasource.getId(), jobId, result.getFinalJobStatus());

            if (observedStatus == null) {
                result.setSuccess(false);
                result.setMessage("Datasource connectivity verification timed out");
                result.setErrorMessage("The test job did not reach a verifiable state within the timeout");
                result.setDurationMs(System.currentTimeMillis() - start);

                tryCleanupAndWaitTerminal(client.getId(), jobId, pollIntervalMs, timeoutMs / 2);

                log.warn("Connectivity verification timed out: clientId={}, datasourceId={}, jobId={}",
                        client.getId(), datasource.getId(), jobId);
                return result;
            }

            if (VERIFY_FAIL_STATUSES.contains(observedStatus)) {
                String logContent = tryReadLog(client.getId(), jobId);

                result.setSuccess(false);
                result.setMessage("Datasource connectivity verification failed");
                result.setErrorMessage(extractReadableError(logContent, observedStatus));
                result.setDurationMs(System.currentTimeMillis() - start);

                log.warn("Connectivity verification failed: clientId={}, datasourceId={}, jobId={}, status={}",
                        client.getId(), datasource.getId(), jobId, observedStatus.name());
                return result;
            }

            if (VERIFY_SUCCESS_STATUSES.contains(observedStatus)) {
                if (ACTIVE_STATUSES.contains(observedStatus)) {
                    stopJobQuietly(client.getId(), jobId);

                    JobStatus terminalStatus = waitForTerminalAfterStop(
                            client.getId(),
                            jobId,
                            timeoutMs / 2,
                            pollIntervalMs
                    );

                    if (terminalStatus != null) {
                        result.setFinalJobStatus(terminalStatus.name());
                    } else {
                        result.setFinalJobStatus("STOPPING_TIMEOUT");
                    }
                }

                result.setSuccess(true);
                result.setMessage("Datasource connectivity verification passed");
                result.setDurationMs(System.currentTimeMillis() - start);

                log.info("Connectivity verification passed: clientId={}, datasourceId={}, jobId={}, finalStatus={}",
                        client.getId(), datasource.getId(), jobId, result.getFinalJobStatus());
                return result;
            }

            result.setSuccess(false);
            result.setMessage("Datasource connectivity verification failed");
            result.setErrorMessage("Unexpected job status: " + observedStatus.name());
            result.setDurationMs(System.currentTimeMillis() - start);

            log.warn("Connectivity verification ended with unexpected status: clientId={}, datasourceId={}, jobId={}, status={}",
                    client.getId(), datasource.getId(), jobId, observedStatus.name());
            return result;

        } catch (Exception e) {
            log.error("Connectivity verification exception: clientId={}, datasourceId={}, jobId={}",
                    client.getId(), datasource.getId(), jobId, e);

            result.setSuccess(false);
            result.setMessage("Datasource connectivity verification failed");
            result.setErrorMessage(simplifyMessage(e));
            result.setDurationMs(System.currentTimeMillis() - start);

            if (jobId != null) {
                tryCleanupAndWaitTerminal(client.getId(), jobId, pollIntervalMs, timeoutMs / 2);
            }

            return result;
        }
    }

    /**
     * Phase 1:
     * Wait until the job reaches either a success state or a failure state.
     */
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

    /**
     * After stop is requested, continue polling until the job reaches a terminal state.
     */
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
            log.warn("Failed to cleanup test job: clientId={}, jobId={}", clientId, jobId, e);
        }
    }

    /**
     * Prefer jobInfo first.
     * Fall back to runningJobs / finishedJobs if needed.
     */
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
            log.info("Stop requested for connectivity verification job: clientId={}, jobId={}",
                    clientId, jobId);
        } catch (Exception e) {
            log.warn("Failed to stop connectivity verification job: clientId={}, jobId={}",
                    clientId, jobId, e);
        }
    }

    private String tryReadLog(Long clientId, Long jobId) {
        try {
            Object logObj = seaTunnelRestClient.logs(clientId, jobId, "TEXT");
            return logObj == null ? null : String.valueOf(logObj);
        } catch (Exception e) {
            log.warn("Failed to read connectivity verification job log: clientId={}, jobId={}",
                    clientId, jobId, e);
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

    private boolean containsJob(List list, Long jobId) {
        if (list == null || list.isEmpty() || jobId == null) {
            return false;
        }

        for (Object item : list) {
            if (item instanceof Map) {
                Map map = (Map) item;
                Long id = toLong(firstNonNull(
                        map.get("jobId"),
                        map.get("job_id"),
                        map.get("id")
                ));
                if (jobId.equals(id)) {
                    return true;
                }
            }
        }

        return false;
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

    private String extractReadableError(String logContent, JobStatus finalStatus) {
        if (!StringUtils.hasText(logContent)) {
            return "Job status is " + (finalStatus == null ? "UNKNOWN" : finalStatus.name());
        }

        String lower = logContent.toLowerCase();

        if (lower.contains("communications link failure")
                || lower.contains("connection refused")
                || lower.contains("connect timed out")
                || lower.contains("unknown host")
                || lower.contains("no route to host")) {
            return "The client cannot reach the datasource host";
        }

        if (lower.contains("access denied")
                || lower.contains("authentication failed")
                || lower.contains("invalid authorization")
                || lower.contains("login failed")
                || lower.contains("ora-01017")) {
            return "Datasource authentication failed, please check username or password";
        }

        if (lower.contains("driver") && lower.contains("not found")) {
            return "Required database driver is missing on the client";
        }

        if (lower.contains("sqlsyntaxerrorexception")
                || lower.contains("syntax error")) {
            return "Test SQL execution failed";
        }

        return "Job status is " + (finalStatus == null ? "UNKNOWN" : finalStatus.name());
    }

    private ClientDatasourceVerifyVO baseResult(
            SeaTunnelClient client,
            DataSource datasource,
            String jobName) {

        ClientDatasourceVerifyVO vo = new ClientDatasourceVerifyVO();
        vo.setClientId(client.getId());
        vo.setClientName(client.getClientName());
        vo.setClientBaseUrl(client.getBaseUrl());
        vo.setDatasourceId(datasource.getId());
        vo.setDatasourceName(datasource.getName());
        vo.setDatasourceType(datasource.getDbType().toString());
        vo.setTestJobName(jobName);
        return vo;
    }

    private String buildJobName(Long clientId, Long datasourceId) {
        return "connectivity_check_" + datasourceId + "_" + clientId + "_" + System.currentTimeMillis();
    }

    private String simplifyMessage(Throwable e) {
        String msg = e.getMessage();
        if (!StringUtils.hasText(msg)) {
            return e.getClass().getSimpleName();
        }
        return msg;
    }
}