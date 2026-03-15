package org.apache.seatunnel.web.api.thirdparty.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.thirdparty.client.SeatunnelRestClient;
import org.apache.seatunnel.web.common.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.web.common.enums.JobSubmitStage;
import org.apache.seatunnel.web.common.exception.JobSubmitException;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@Slf4j
public class JobSubmitter {

    private final JobConfigFileService configFileService;
    private final SeatunnelRestClient restClient;
    private final JobMetricsMonitor metricsMonitor;
    private final JobResultWatcher resultWatcher;
    private final JobResultHandler resultHandler;
    private final SeaTunnelJobInstanceService instanceService;

    public JobSubmitter(JobConfigFileService configFileService,
                        SeatunnelRestClient restClient,
                        JobMetricsMonitor metricsMonitor,
                        JobResultWatcher resultWatcher,
                        JobResultHandler resultHandler,
                        SeaTunnelJobInstanceService instanceService) {
        this.configFileService = configFileService;
        this.restClient = restClient;
        this.metricsMonitor = metricsMonitor;
        this.resultWatcher = resultWatcher;
        this.resultHandler = resultHandler;
        this.instanceService = instanceService;
    }

    public void submit(Long instanceId, String hoconConfig) {
        SeatunnelJobInstancePO instancePO = instanceService.getById(instanceId);
        String logPath = instancePO.getLogPath();

        JobFileLogger jobLogger = new JobFileLogger(logPath);
        jobLogger.info("=== Job Submit Start (REST API) ===");
        jobLogger.info("Job instanceId: " + instanceId);

        String configFile = null;
        Long engineId = null;

        try {
            jobLogger.info("Writing config file...");
            configFile = configFileService.writeConfig(instanceId, hoconConfig);
            jobLogger.info("Config file written to: " + configFile);

            jobLogger.info("Submitting job via REST API...");
            String filename = "job-" + instanceId + ".conf";
            Map resp = restClient.submitJobUpload(
                    (hoconConfig == null ? "" : hoconConfig).getBytes(StandardCharsets.UTF_8),
                    filename
            );

            engineId = extractJobId(resp);
            jobLogger.info("Job submitted, engineId(jobId): " + engineId);

            resultHandler.updateEngineId(instanceId, engineId);

            JobRuntimeContext ctx = new JobRuntimeContext(instanceId, engineId, configFile);

            try {
                metricsMonitor.register(ctx);
                jobLogger.info("Metrics monitor registered");
            } catch (Exception e) {
                jobLogger.warn("Metrics monitor register failed: " + e.getMessage());
                log.warn("Metrics monitor register failed, instanceId={}, engineId={}", instanceId, engineId, e);
                throw new JobSubmitException(JobSubmitStage.POST_SUBMIT, "Metrics monitor register failed", e);
            }

            try {
                resultWatcher.registerByRest(ctx);
                jobLogger.info("REST result watcher registered");
            } catch (Exception e) {
                jobLogger.warn("Result watcher register failed: " + e.getMessage());
                log.warn("Result watcher register failed, instanceId={}, engineId={}", instanceId, engineId, e);
                throw new JobSubmitException(JobSubmitStage.POST_SUBMIT, "Result watcher register failed", e);
            }

            jobLogger.info("=== Job Submit Complete ===");

        } catch (JobSubmitException postStage) {
            if (postStage.getStage() == JobSubmitStage.POST_SUBMIT) {
                jobLogger.warn("=== Job Submit Done (but post-submit failed) ===");
                throw postStage;
            }
            handleCoreFailure(jobLogger, instanceId, postStage);

        } catch (Exception e) {
            handleCoreFailure(jobLogger, instanceId, e);

        } finally {
            jobLogger.close();
        }
    }

    private void handleCoreFailure(JobFileLogger jobLogger, Long instanceId, Exception e) {
        jobLogger.error("Job submit failed (core stage)", e);

        try {
            resultHandler.handleFailure(instanceId, e);
        } catch (Exception handlerEx) {
            log.error("handleFailure threw exception, instanceId={}", instanceId, handlerEx);
        }

        throw (e instanceof JobSubmitException)
                ? (JobSubmitException) e
                : new JobSubmitException(JobSubmitStage.SUBMIT, "Submit job failed", e);
    }

    private Long extractJobId(Map resp) {
        Object jobIdObj = resp == null ? null : resp.get("jobId");
        if (jobIdObj == null) {
            throw new IllegalStateException("REST submit response missing jobId, resp=" + resp);
        }
        return Long.valueOf(jobIdObj.toString());
    }
}