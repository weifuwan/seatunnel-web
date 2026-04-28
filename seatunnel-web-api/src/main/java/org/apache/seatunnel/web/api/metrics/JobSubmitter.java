package org.apache.seatunnel.web.api.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobSubmitStage;
import org.apache.seatunnel.web.common.exception.JobSubmitException;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@Slf4j
public class JobSubmitter {

    private final JobConfigFileService configFileService;
    private final SeaTunnelRestClient restClient;
    private final JobMetricsMonitor metricsMonitor;
    private final JobResultWatcher resultWatcher;
    private final JobResultHandler resultHandler;

    public JobSubmitter(JobConfigFileService configFileService,
                        SeaTunnelRestClient restClient,
                        JobMetricsMonitor metricsMonitor,
                        JobResultWatcher resultWatcher,
                        JobResultHandler resultHandler) {
        this.configFileService = configFileService;
        this.restClient = restClient;
        this.metricsMonitor = metricsMonitor;
        this.resultWatcher = resultWatcher;
        this.resultHandler = resultHandler;
    }

    public void submit(JobInstanceVO instance) {
        validate(instance);

        Long instanceId = instance.getId();
        Long jobDefinitionId = instance.getJobDefinitionId();
        Long clientId = instance.getClientId();

        String hoconConfig = instance.getRuntimeConfig();
        String logPath = instance.getLogPath();

        JobFileLogger jobLogger = new JobFileLogger(logPath);
        jobLogger.info("=== Job Submit Start (REST API) ===");
        jobLogger.info("Job instanceId: " + instanceId);
        jobLogger.info("Job definitionId: " + jobDefinitionId);
        jobLogger.info("Client id: " + clientId);

        String configFile = null;
        Long engineId = null;
        boolean submitted = false;

        try {
            jobLogger.info("Writing config file...");
            configFile = configFileService.writeConfig(instanceId, hoconConfig);
            jobLogger.info("Config file written to: " + configFile);

            jobLogger.info("Submitting job via REST API...");
            log.info("Submitting job to Zeta, instanceId={}, clientId={}", instanceId, clientId);

            String filename = "job-" + instanceId + ".conf";

            Map<?, ?> resp = restClient.submitJobUpload(
                    clientId,
                    safeConfig(hoconConfig).getBytes(StandardCharsets.UTF_8),
                    filename
            );

            log.info("Submit job response received, instanceId={}, resp={}", instanceId, resp);
            jobLogger.info("Submit job response received: " + resp);

            resultHandler.updateEngineId(instanceId, engineId);

            JobRuntimeContext ctx = buildRuntimeContext(
                    instanceId,
                    jobDefinitionId,
                    clientId,
                    engineId,
                    configFile
            );

            registerPostSubmitWatchers(ctx, jobLogger);

            jobLogger.info("=== Job Submit Complete ===");

        } catch (Exception e) {
            if (submitted) {
                handlePostSubmitFailure(jobLogger, instanceId, engineId, e);
                return;
            }

            handleCoreFailure(jobLogger, instanceId, e);

        } finally {
            jobLogger.close();
        }
    }

    private void validate(JobInstanceVO instance) {
        if (instance == null) {
            throw new IllegalArgumentException("Job instance must not be null");
        }

        if (instance.getId() == null) {
            throw new IllegalArgumentException("Job instance id must not be null");
        }

        if (instance.getClientId() == null) {
            throw new IllegalArgumentException("Job client id must not be null");
        }

        if (StringUtils.isBlank(instance.getLogPath())) {
            throw new IllegalArgumentException("Job log path must not be blank");
        }

        if (StringUtils.isBlank(instance.getRuntimeConfig())) {
            throw new IllegalArgumentException("Job runtime config must not be blank");
        }
    }

    private JobRuntimeContext buildRuntimeContext(Long instanceId,
                                                  Long jobDefinitionId,
                                                  Long clientId,
                                                  Long engineId,
                                                  String configFile) {
        JobRuntimeContext ctx = new JobRuntimeContext();
        ctx.setInstanceId(instanceId);
        ctx.setJobDefinitionId(jobDefinitionId);
        ctx.setClientId(clientId);
        ctx.setEngineId(engineId);
        ctx.setConfigFile(configFile);
        return ctx;
    }

    private void registerPostSubmitWatchers(JobRuntimeContext ctx,
                                            JobFileLogger jobLogger) {
        boolean metricsRegistered = false;
        boolean watcherRegistered = false;

        try {
            metricsMonitor.register(ctx);
            metricsRegistered = true;
            jobLogger.info("Metrics monitor registered");
        } catch (Exception e) {
            jobLogger.warn("Metrics monitor register failed: " + e.getMessage());
            log.warn(
                    "Metrics monitor register failed, instanceId={}, engineId={}",
                    ctx.getInstanceId(),
                    ctx.getEngineId(),
                    e
            );
        }

        try {
            resultWatcher.registerByRest(ctx);
            watcherRegistered = true;
            jobLogger.info("REST result watcher registered");
        } catch (Exception e) {
            jobLogger.warn("Result watcher register failed: " + e.getMessage());
            log.warn(
                    "Result watcher register failed, instanceId={}, engineId={}",
                    ctx.getInstanceId(),
                    ctx.getEngineId(),
                    e
            );
        }

        if (!metricsRegistered || !watcherRegistered) {
            jobLogger.warn(
                    "Post-submit watcher registration incomplete. " +
                            "The job has already been submitted to SeaTunnel Engine. " +
                            "metricsRegistered=" + metricsRegistered +
                            ", watcherRegistered=" + watcherRegistered
            );
        }
    }

    private void handleCoreFailure(JobFileLogger jobLogger,
                                   Long instanceId,
                                   Exception e) {
        jobLogger.error("Job submit failed before engine accepted the job", e);

        try {
            resultHandler.handleFailure(instanceId, e);
        } catch (Exception handlerEx) {
            log.error("handleFailure threw exception, instanceId={}", instanceId, handlerEx);
        }

        throw (e instanceof JobSubmitException)
                ? (JobSubmitException) e
                : new JobSubmitException(JobSubmitStage.SUBMIT, "Submit job failed", e);
    }

    private void handlePostSubmitFailure(JobFileLogger jobLogger,
                                         Long instanceId,
                                         Long engineId,
                                         Exception e) {
        jobLogger.error(
                "Job was submitted to SeaTunnel Engine, but post-submit handling failed. " +
                        "instanceId=" + instanceId + ", engineId=" + engineId,
                e
        );

        log.warn(
                "Post-submit handling failed after job accepted by engine, instanceId={}, engineId={}",
                instanceId,
                engineId,
                e
        );

        /*
         * Do not mark the job instance as FAILED here.
         *
         * Reason:
         * The SeaTunnel Engine has already accepted the job. If we mark the local
         * instance as failed now, local state may conflict with the real engine state.
         */
    }

    private Long extractJobId(Map<?, ?> resp) {
        Object jobIdObj = resp == null ? null : resp.get("jobId");

        if (jobIdObj == null) {
            throw new IllegalStateException("REST submit response missing jobId, resp=" + resp);
        }

        return Long.valueOf(jobIdObj.toString());
    }

    private String safeConfig(String config) {
        return config == null ? "" : config;
    }
}