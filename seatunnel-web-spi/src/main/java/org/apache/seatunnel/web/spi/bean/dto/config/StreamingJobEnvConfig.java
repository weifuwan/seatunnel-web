package org.apache.seatunnel.web.spi.bean.dto.config;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class StreamingJobEnvConfig extends JobEnvConfig {

    private Integer checkpointInterval;

}