package org.apache.seatunnel.web.core.builder;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigRenderOptions;
import org.apache.seatunnel.web.spi.bean.dto.config.BatchJobEnvConfig;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class EnvConfigBuilder {

    public String build(BatchJobEnvConfig envConfig) {
        if (envConfig == null) {
            throw new IllegalArgumentException("JobBasicConfig cannot be null");
        }

        Map<String, Object> envMap = new LinkedHashMap<>();
        fillCommonConfig(envMap, envConfig);

        Config cfg = ConfigFactory.parseMap(envMap);
        return cfg.root().render(
                ConfigRenderOptions.defaults()
                        .setJson(false)
                        .setComments(false)
                        .setOriginComments(false)
        );
    }

    private void fillCommonConfig(Map<String, Object> envMap, BatchJobEnvConfig envConfig) {
        if (envConfig.getJobMode() != null) {
            envMap.put("job.mode", envConfig.getJobMode().getCode());
        }

        if (envConfig.getParallelism() != null && envConfig.getParallelism() > 0) {
            envMap.put("parallelism", envConfig.getParallelism());
        }
    }

}