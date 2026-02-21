package org.apache.seatunnel.plugin.client.twelve;

import com.hazelcast.client.config.ClientConfig;
import com.hazelcast.client.config.YamlClientConfigBuilder;
import com.hazelcast.client.config.impl.YamlClientConfigLocator;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.common.config.Common;
import org.apache.seatunnel.common.config.DeployMode;
import org.apache.seatunnel.communal.spi.client.SeatunnelClient;
import org.apache.seatunnel.engine.client.SeaTunnelClient;
import org.apache.seatunnel.engine.client.job.ClientJobExecutionEnvironment;
import org.apache.seatunnel.engine.client.job.ClientJobProxy;
import org.apache.seatunnel.engine.common.config.JobConfig;
import org.apache.seatunnel.engine.common.config.SeaTunnelConfig;
import org.apache.seatunnel.engine.common.config.YamlSeaTunnelConfigBuilder;
import org.apache.seatunnel.engine.common.job.JobResult;
import org.apache.seatunnel.engine.common.job.JobStatus;

import java.util.Arrays;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static com.hazelcast.internal.config.DeclarativeConfigUtil.SYSPROP_CLIENT_CONFIG;
import static com.hazelcast.internal.config.DeclarativeConfigUtil.validateSuffixInSystemProperty;

@Slf4j
public class TwelveSeatunnelClient implements SeatunnelClient {

    public TwelveSeatunnelClient() {
    }

    @Override
    public void jobExecute(String configFile, Long instanceId) throws Exception {
        Common.setDeployMode(DeployMode.CLIENT);
        JobConfig jobConfig = new JobConfig();
        jobConfig.setName(instanceId + "_job");
        SeaTunnelClient seaTunnelClient;
        ClientJobProxy clientJobProxy;
        seaTunnelClient = createSeaTunnelClient();
        SeaTunnelConfig seaTunnelConfig = new YamlSeaTunnelConfigBuilder().build();
        ClientJobExecutionEnvironment jobExecutionEnv =
                seaTunnelClient.createExecutionContext(configFile, jobConfig, seaTunnelConfig);

        clientJobProxy = jobExecutionEnv.execute();
        CompletableFuture.runAsync(
                () -> {
                    waitJobFinish(
                            clientJobProxy,
                            seaTunnelClient);
                });
    }

    @Override
    public void jobExecuteUseAdHoc(String configFile) throws Exception{
        Common.setDeployMode(DeployMode.CLIENT);
        JobConfig jobConfig = new JobConfig();
        jobConfig.setName(UUID.randomUUID().toString() + "_job");
        SeaTunnelClient seaTunnelClient;
        ClientJobProxy clientJobProxy;
        seaTunnelClient = createSeaTunnelClient();
        SeaTunnelConfig seaTunnelConfig = new YamlSeaTunnelConfigBuilder().build();
        ClientJobExecutionEnvironment jobExecutionEnv =
                seaTunnelClient.createExecutionContext(configFile, jobConfig, seaTunnelConfig);

        clientJobProxy = jobExecutionEnv.execute();
        CompletableFuture.runAsync(
                () -> {
                    waitJobFinish(
                            clientJobProxy,
                            seaTunnelClient);
                });
    }

    public void waitJobFinish(
            ClientJobProxy clientJobProxy,
            SeaTunnelClient seaTunnelClient) {
        ExecutorService executor = Executors.newFixedThreadPool(1);

        CompletableFuture<JobResult> future =
                CompletableFuture.supplyAsync(clientJobProxy::waitForJobCompleteV2, executor);
        JobResult jobResult = new JobResult(JobStatus.FAILED, "");
        log.info(jobResult.toString());
        try {
            jobResult = future.get();
            executor.shutdown();
        } catch (InterruptedException | ExecutionException e) {
            jobResult.setError(e.getMessage());
            throw new RuntimeException(e);
        } finally {
            seaTunnelClient.close();
            log.info("and jobInstanceService.complete begin");
        }
    }

    private SeaTunnelClient createSeaTunnelClient() {
        ClientConfig clientConfig = locateAndGetClientConfig();
        return new SeaTunnelClient(clientConfig);
    }

    @NonNull
    public static ClientConfig locateAndGetClientConfig() {
        validateSuffixInSystemProperty(SYSPROP_CLIENT_CONFIG);

        ClientConfig config;
        YamlClientConfigLocator yamlConfigLocator = new YamlClientConfigLocator();

        if (yamlConfigLocator.locateFromSystemProperty()) {
            // 1. Try loading config if provided in system property, and it is an YAML file
            config = new YamlClientConfigBuilder(yamlConfigLocator.getIn()).build();
        } else if (yamlConfigLocator.locateInWorkDirOrOnClasspath()) {
            // 2. Try loading YAML config from the working directory or from the classpath
            config = new YamlClientConfigBuilder(yamlConfigLocator.getIn()).build();
        } else {
            // 3. Loading the default YAML configuration file
            yamlConfigLocator.locateDefault();
            config = new YamlClientConfigBuilder(yamlConfigLocator.getIn()).build();
        }
        String stDockerMemberList = System.getenv("ST_DOCKER_MEMBER_LIST");
        if (stDockerMemberList != null) {
            config.getNetworkConfig().setAddresses(Arrays.asList(stDockerMemberList.split(",")));
        }
        return config;
    }


    public static Properties createHazelcastProperties() {
        Properties properties = new Properties();

        // 从clientPO获取IP地址
        String ipAddress = "192.168.1.115:5801";

        // 设置固定配置参数
        properties.setProperty("hazelcast-client.cluster-name", "seatunnel");
        properties.setProperty("hazelcast-client.properties.hazelcast.logging.type", "log4j2");
        properties.setProperty("hazelcast-client.connection-strategy.async-start", "true");
        properties.setProperty("hazelcast-client.connection-strategy.connection-retry.cluster-connect-timeout-millis", "3000");
        properties.setProperty("hazelcast-client.connection-strategy.reconnect-mode", "OFF");

        // 设置动态的cluster-members
        // 注意：Properties不支持列表，所以使用逗号分隔的形式
        properties.setProperty("hazelcast-client.network.cluster-members", ipAddress);

        return properties;
    }

}

