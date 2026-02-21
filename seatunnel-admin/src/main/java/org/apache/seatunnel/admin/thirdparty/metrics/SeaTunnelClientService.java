package org.apache.seatunnel.admin.thirdparty.metrics;

import com.hazelcast.client.config.ClientConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.common.config.Common;
import org.apache.seatunnel.common.config.DeployMode;
import org.apache.seatunnel.engine.client.SeaTunnelClient;
import org.apache.seatunnel.engine.client.job.ClientJobExecutionEnvironment;
import org.apache.seatunnel.engine.client.job.ClientJobProxy;
import org.apache.seatunnel.engine.common.config.ConfigProvider;
import org.apache.seatunnel.engine.common.config.JobConfig;
import org.apache.seatunnel.engine.common.config.SeaTunnelConfig;
import org.apache.seatunnel.engine.common.config.YamlSeaTunnelConfigBuilder;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for managing a shared SeaTunnelClient instance
 * and submitting SeaTunnel jobs.
 *
 * <p>
 * This service uses a singleton-style client with reference counting
 * to avoid creating multiple Hazelcast connections.
 * </p>
 */
@Service
@Slf4j
public class SeaTunnelClientService implements AutoCloseable {

    /**
     * Shared SeaTunnel client instance.
     * Marked as volatile to ensure visibility across threads.
     */
    private volatile SeaTunnelClient client;

    /**
     * Lock object used for thread-safe client initialization and shutdown.
     */
    private final Object lock = new Object();

    /**
     * Reference counter for tracking how many callers are using the client.
     * Can be extended later for smart lifecycle management.
     */
    private final AtomicInteger refCount = new AtomicInteger(0);

    /**
     * Get an existing SeaTunnelClient or create one if it does not exist.
     *
     * <p>
     * Uses double-checked locking to ensure thread-safe lazy initialization.
     * </p>
     *
     * @return shared SeaTunnelClient instance
     */
    public SeaTunnelClient getOrCreateClient() {
        if (client == null) {
            synchronized (lock) {
                if (client == null) {
                    // Load Hazelcast client configuration
                    ClientConfig clientConfig = ConfigProvider.locateAndGetClientConfig();

                    // Create SeaTunnel client
                    client = new SeaTunnelClient(clientConfig);
                    log.info("Created shared SeaTunnelClient");
                }
            }
        }

        // Increase reference count for current usage
        refCount.incrementAndGet();
        return client;
    }

    /**
     * Submit a SeaTunnel job using the given configuration file.
     *
     * @param configFile    path to the SeaTunnel job config file
     * @param jobInstanceId unique job instance identifier
     * @return ClientJobProxy for tracking job execution
     * @throws Exception if job submission fails
     */
    public ClientJobProxy submitJob(String configFile, Long jobInstanceId) throws Exception {
        Common.setDeployMode(DeployMode.CLIENT);

        JobConfig jobConfig = new JobConfig();
        jobConfig.setName(buildJobName(jobInstanceId));

        SeaTunnelClient client = getOrCreateClient();

        SeaTunnelConfig seaTunnelConfig = new YamlSeaTunnelConfigBuilder().build();

        ClientJobExecutionEnvironment executionEnv =
                client.createExecutionContext(configFile, jobConfig, seaTunnelConfig);

        return executionEnv.execute();
    }

    /**
     * Close and release the shared SeaTunnel client.
     *
     * <p>
     * This method is synchronized to prevent concurrent close operations.
     * </p>
     */
    @Override
    public void close() {
        synchronized (lock) {
            if (client != null) {
                client.close();
                client = null;
                log.info("Closed shared SeaTunnelClient");
            }
        }
    }

    /**
     * Build a readable job name based on the job instance ID.
     *
     * @param jobInstanceId job instance identifier
     * @return formatted job name
     */
    private String buildJobName(Long jobInstanceId) {
        return jobInstanceId + "_job";
    }
}
