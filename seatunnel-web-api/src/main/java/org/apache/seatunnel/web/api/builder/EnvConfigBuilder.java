package org.apache.seatunnel.web.api.builder;


import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigRenderOptions;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class EnvConfigBuilder {

    public String build(BaseJobDefinitionCommand dto) {
        Map<String, Object> map = new HashMap<>();
        map.put("job.mode", dto.getJobType().getCode());
        map.put("parallelism", dto.getParallelism());
        JobMode jobMode = dto.getJobType();
        if (jobMode == JobMode.STREAMING) {
            SeatunnelStreamingJobDefinitionDTO streamDot = (SeatunnelStreamingJobDefinitionDTO) dto;
            map.put("checkpoint.interval", streamDot.getCheckpointConfig());
            map.put("checkpoint.timeout", streamDot.getCheckpointConfig());
        }

        Config cfg = ConfigFactory.parseMap(map);

        return cfg.root().render(
                ConfigRenderOptions.defaults()
                        .setJson(false)
                        .setComments(false)
                        .setOriginComments(false));
    }
}
