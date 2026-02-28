package org.apache.seatunnel.admin.thirdparty.metrics;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.engine.client.job.ClientJobProxy;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class JobSubmitter {

    @Resource
    private JobConfigFileService configFileService;

    @Resource
    private SeaTunnelClientService clientService;

    @Resource
    private JobMetricsMonitor metricsMonitor;

    @Resource
    private JobResultWatcher resultWatcher;

    @Resource
    private JobResultHandler resultHandler;

    @Resource
    private SeatunnelJobInstanceService instanceService;

    /**
     * Submit a SeaTunnel job instance.
     * <p>
     * Execution flow:
     * 1. Write HOCON config file
     * 2. Submit job to SeaTunnel engine
     * 3. Register metrics monitoring
     * 4. Register job result watcher
     *
     * @param instanceId  Job instance ID in admin system
     * @param hoconConfig HOCON configuration content
     */
    public void submit(Long instanceId, String hoconConfig) {

        // Fetch job instance information (e.g., log path)
        SeatunnelJobInstancePO instancePO = instanceService.getById(instanceId);
        String logPath = instancePO.getLogPath();

        // Create a dedicated file logger for this job
        JobFileLogger jobLogger = new JobFileLogger(logPath);
        jobLogger.info("=== Job Submit Start ===");
        jobLogger.info("Job instanceId: " + instanceId);

        boolean success = false;

        try {
            // Step 1: Write configuration file
            jobLogger.info("Writing config file...");
            String configFile = configFileService.writeConfig(instanceId, hoconConfig);
            jobLogger.info("Config file written to: " + configFile);

            // Step 2: Submit job to SeaTunnel engine
            jobLogger.info("Submitting job to engine...");
            ClientJobProxy proxy = clientService.submitJob(configFile, instanceId);

            // Retrieve engine-side job ID
            String engineId = String.valueOf(proxy.getJobId());
            jobLogger.info("Job submitted to engineId: " + engineId);

            // Update engine ID in persistent storage
            resultHandler.updateEngineId(instanceId, engineId);

            // Build runtime context object
            JobRuntimeContext context =
                    new JobRuntimeContext(instanceId, engineId, configFile);

            // Step 3: Register metrics monitoring
            metricsMonitor.register(context);
            jobLogger.info("Metrics monitor registered");

            // Step 4: Register asynchronous result watcher
            resultWatcher.register(context, proxy);
            jobLogger.info("Result watcher registered");

            jobLogger.info("=== Job Submit Complete ===");
            success = true;
        } catch (Exception e) {
            // Log submission failure
            jobLogger.error("Job submit failed", e);
            resultHandler.handleFailure(instanceId, e);
            throw new RuntimeException("Submit job failed", e);
        } finally {
            if (!success) {
                log.error("Job submission ended unsuccessfully: {}", instanceId);
            }
            // Close job-specific logger
            jobLogger.close();
        }
    }
}
