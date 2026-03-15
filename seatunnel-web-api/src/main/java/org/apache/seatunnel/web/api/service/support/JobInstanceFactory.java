package org.apache.seatunnel.web.api.service.support;

import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;

@Component
public class JobInstanceFactory {

    public SeatunnelJobInstancePO create(BaseJobDefinitionCommand dto,
                                         Long instanceId,
                                         String runtimeConfig,
                                         RunMode runMode,
                                         String logPath) {
        Date now = new Date();

        return SeatunnelJobInstancePO.builder()
                .id(instanceId)
                .jobDefinitionId(dto.getId())
                .jobType(resolveJobMode(dto))
                .syncMode(resolveSyncMode(dto))
                .runMode(runMode)
                .jobStatus(JobStatus.RUNNING)
                .runtimeConfig(runtimeConfig)
                .logPath(logPath)
                .retryCount(0)
                .configVersion(dto.getJobVersion())
                .configChecksum(buildChecksum(runtimeConfig))
                .startTime(now)
                .createTime(now)
                .updateTime(now)
                .build();
    }

    private JobMode resolveJobMode(BaseJobDefinitionCommand dto) {
        return JobMode.valueOf(dto.getJobType().name());
    }

    private SyncModeEnum resolveSyncMode(BaseJobDefinitionCommand dto) {
        return dto.getSyncMode();
    }

    private String buildChecksum(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}