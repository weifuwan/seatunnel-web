package org.apache.seatunnel.web.spi.bean.dto.config;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class StreamingJobEnvConfig extends JobEnvConfig {

    /**
     * 重启策略，例如：
     * none / fixed_delay / failure_rate
     */
    private String restartStrategy;

    /**
     * 最大重启次数
     */
    private Integer restartAttempts;

    /**
     * 重启间隔，单位秒
     */
    private Integer restartDelaySeconds;
}