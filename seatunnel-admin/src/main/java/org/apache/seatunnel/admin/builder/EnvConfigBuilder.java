package org.apache.seatunnel.admin.builder;


import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigRenderOptions;
import org.apache.seatunnel.communal.bean.dto.BaseSeatunnelJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.communal.enums.JobMode;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class EnvConfigBuilder {

    public String build(BaseSeatunnelJobDefinitionDTO dto) {
        Map<String, Object> map = new HashMap<>();
        map.put("job.mode", dto.getJobType());
        map.put("parallelism", dto.getParallelism());
        JobMode jobMode = JobMode.valueOf(dto.getJobType());
        if (jobMode == JobMode.STREAMING) {
            SeatunnelStreamJobDefinitionDTO streamDot = (SeatunnelStreamJobDefinitionDTO) dto;
            map.put("checkpoint.interval", streamDot.getCheckpointInterval());
            map.put("checkpoint.timeout", streamDot.getCheckpointTimeout());
        }

        Config cfg = ConfigFactory.parseMap(map);

        return cfg.root().render(
                ConfigRenderOptions.defaults()
                        .setJson(false)
                        .setComments(false)
                        .setOriginComments(false));
    }
}
