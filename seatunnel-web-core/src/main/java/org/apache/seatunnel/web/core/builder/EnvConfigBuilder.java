package org.apache.seatunnel.web.core.builder;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigRenderOptions;
import org.apache.seatunnel.web.spi.bean.dto.JobBasicConfig;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class EnvConfigBuilder {

    public String build(JobBasicConfig basic) {
        if (basic == null) {
            throw new IllegalArgumentException("JobBasicConfig cannot be null");
        }

        Map<String, Object> envMap = new LinkedHashMap<>();
        fillCommonConfig(envMap, basic);
        fillBatchConfig(envMap, basic);

        Config cfg = ConfigFactory.parseMap(envMap);
        return cfg.root().render(
                ConfigRenderOptions.defaults()
                        .setJson(false)
                        .setComments(false)
                        .setOriginComments(false)
        );
    }

    private void fillCommonConfig(Map<String, Object> envMap, JobBasicConfig basic) {
        if (basic.getJobType() != null) {
            envMap.put("job.mode", basic.getJobType().getCode());
        }

        if (basic.getParallelism() != null && basic.getParallelism() > 0) {
            envMap.put("parallelism", basic.getParallelism());
        }
    }

    private void fillBatchConfig(Map<String, Object> envMap, JobBasicConfig basic) {

    }
}