package org.apache.seatunnel.web.core.job.handler;

import lombok.Builder;
import lombok.Data;
import org.apache.seatunnel.web.spi.bean.dto.config.JobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobScheduleConfig;
import org.apache.seatunnel.web.spi.enums.JobRuntimeType;

@Data
@Builder
public class JobRuntimeContext {

    private JobRuntimeType runtimeType;

    private JobEnvConfig env;

    private JobScheduleConfig schedule;

    public boolean isBatch() {
        return JobRuntimeType.BATCH == runtimeType;
    }

    public boolean isStreaming() {
        return JobRuntimeType.STREAMING == runtimeType;
    }
}