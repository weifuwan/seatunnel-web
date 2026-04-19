package org.apache.seatunnel.web.api.service.support;

import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JobInstanceFactory {

    /**
     * Create a new job instance record.
     */
    public JobInstance create(JobDefinitionSaveCommand dto,
                              Long instanceId,
                              String runtimeConfig,
                              RunMode runMode,
                              String logPath) {
        Date now = new Date();

        return JobInstance.builder()
                .id(instanceId)
                .jobDefinitionId(dto.getId())
                .runMode(runMode)
                .jobStatus(JobStatus.RUNNING)
                .clientId(dto.getBasic().getClientId())
                .triggerSource(resolveTriggerSource(runMode))
                .retryCount(0)
                .runtimeConfig(runtimeConfig)
                .logPath(logPath)
                .submitTime(now)
                .createTime(now)
                .updateTime(now)
                .build();
    }

    /**
     * Resolve trigger source from run mode.
     */
    private String resolveTriggerSource(RunMode runMode) {
        if (runMode == null) {
            return null;
        }
        return runMode.name();
    }
}