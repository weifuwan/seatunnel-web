package org.apache.seatunnel.admin.thirdparty.engine;

import com.hazelcast.client.config.ClientConfig;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.engine.client.SeaTunnelClient;
import org.apache.seatunnel.engine.common.config.ConfigProvider;
import org.apache.seatunnel.engine.common.config.JobConfig;
import org.apache.seatunnel.engine.common.config.SeaTunnelConfig;
import org.apache.seatunnel.engine.common.config.YamlSeaTunnelConfigBuilder;
import org.apache.seatunnel.engine.common.job.JobStatus;
import org.apache.seatunnel.engine.core.job.JobDAGInfo;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@Slf4j
public class SeaTunnelEngineProxy {

    private static volatile SeaTunnelClient sharedClient;
    private static final Object LOCK = new Object();
    private final ClientConfig clientConfig;

    private static class SeaTunnelEngineProxyHolder {
        private static final SeaTunnelEngineProxy INSTANCE = new SeaTunnelEngineProxy();
    }

    public static SeaTunnelEngineProxy getInstance() {
        return SeaTunnelEngineProxyHolder.INSTANCE;
    }

    private SeaTunnelEngineProxy() {
        clientConfig = ConfigProvider.locateAndGetClientConfig();
    }

    private SeaTunnelClient getClient() {
        if (sharedClient == null) {
            synchronized (LOCK) {
                if (sharedClient == null) {
                    if (sharedClient != null) {
                        try {
                            sharedClient.close();
                        } catch (Exception e) {
                            log.warn("Close old client error", e);
                        }
                    }
                    sharedClient = new SeaTunnelClient(clientConfig);
                    log.info("Created shared SeaTunnelClient");
                }
            }
        }
        return sharedClient;
    }


    public String getMetricsContent(@NonNull String jobEngineId) {
        return getClient().getJobMetrics(Long.valueOf(jobEngineId));
    }

    public String getJobPipelineStatusStr(@NonNull String jobEngineId) {
        return getClient().getJobDetailStatus(Long.valueOf(jobEngineId));
    }

    public JobDAGInfo getJobInfo(@NonNull String jobEngineId) {
        return getClient().getJobInfo(Long.valueOf(jobEngineId));
    }

    public JobStatus getJobStatus(@NonNull String jobEngineId) {
        try {
            return JobStatus.valueOf(getClient().getJobStatus(Long.valueOf(jobEngineId)));
        } catch (Exception e) {
            log.warn("Can not get job from engine.", e);
            return null;
        }
    }

    public Map<String, String> getClusterHealthMetrics() {
        return getClient().getClusterHealthMetrics();
    }

    public String getAllRunningJobMetricsContent() {
        return getClient().getJobClient().getRunningJobMetrics();
    }

    public void pauseJob(@NonNull String jobEngineId) {
        try {
            getClient().getJobClient().savePointJob(Long.valueOf(jobEngineId));
        } catch (Exception e) {
            log.warn("Can not pause job from engine.", e);
        }
    }

    public void restoreJob(
            @NonNull String filePath, @NonNull Long jobInstanceId, @NonNull Long jobEngineId) {
        JobConfig jobConfig = new JobConfig();
        jobConfig.setName(jobInstanceId + "_job");
        SeaTunnelConfig seaTunnelConfig = new YamlSeaTunnelConfigBuilder().build();
        try {
            getClient()
                    .restoreExecutionContext(filePath, jobConfig, seaTunnelConfig, jobEngineId)
                    .execute();
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public void shutdown() {
        synchronized (LOCK) {
            if (sharedClient != null) {
                sharedClient.close();
                sharedClient = null;
                log.info("Shutdown SeaTunnelClient");
            }
        }
    }
}