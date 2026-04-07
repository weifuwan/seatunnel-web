package org.apache.seatunnel.web.core.verify.job;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class TestJobEnvConfigBuilder {

    public Config buildBatchEnv() {
        Map<String, Object> map = new HashMap<String, Object>(8);
        map.put("parallelism", 1);
        map.put("job.mode", "BATCH");
        return ConfigFactory.parseMap(map);
    }
}
