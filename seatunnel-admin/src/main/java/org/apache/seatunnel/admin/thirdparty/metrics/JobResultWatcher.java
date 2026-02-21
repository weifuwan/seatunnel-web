package org.apache.seatunnel.admin.thirdparty.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.engine.client.job.ClientJobProxy;
import org.apache.seatunnel.engine.common.job.JobResult;
import org.apache.seatunnel.engine.common.job.JobStatus;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@Slf4j
public class JobResultWatcher {

    /**
     * Thread pool used to asynchronously wait for job completion.
     * Cached thread pool allows dynamic thread allocation based on workload.
     */
    private final ExecutorService executor =
            Executors.newCachedThreadPool();

    @Resource
    private JobMetricsMonitor metricsMonitor;

    @Resource
    private JobResultHandler resultHandler;

    /**
     * Register a job result watcher for a running job.
     *
     * This method submits an asynchronous task that:
     * 1. Blocks until the job finishes
     * 2. Handles success or failure result
     * 3. Unregisters metrics monitoring
     *
     * @param context Job runtime context containing instance information
     * @param proxy   Client proxy used to interact with the SeaTunnel engine
     */
    public void register(JobRuntimeContext context, ClientJobProxy proxy) {

        executor.submit(() -> {

            try {
                // Block until the job completes (success or failure)
                JobResult result = proxy.waitForJobCompleteV2();

                // Handle job completion status
                if (result.getStatus() == JobStatus.FINISHED) {
                    // Job completed successfully
                    resultHandler.handleSuccess(context.getInstanceId());
                } else {
                    // Job finished with failure or abnormal status
                    resultHandler.handleFailure(context.getInstanceId(), result);
                }

            } catch (Exception e) {
                // Handle unexpected exception during job execution
                resultHandler.handleFailure(context.getInstanceId(), e);
            } finally {
                // Always unregister metrics monitoring after job completion
                metricsMonitor.unregister(context.getInstanceId());

                log.info("Job result watcher finished: {}",
                        context.getInstanceId());
            }
        });
    }
}
