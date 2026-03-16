package org.apache.seatunnel.web.spi.bean.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.seatunnel.web.common.enums.*;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SeatunnelJobInstanceVO {

    private Long id;

    private Long jobDefinitionId;

    private String jobName;
    private String jobDesc;
    private Integer jobVersion;
    private String sourceType;
    private String sinkType;
    private Integer parallelism;

    private SyncModeEnum syncMode;

    /**
     * Executable runtime config snapshot
     */
    private String runtimeConfig;

    /**
     * Engine-side job id, keep string for compatibility
     */
    private String engineJobId;

    private String engineType;

    private String engineEndpoint;

    private String logPath;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date endTime;

    private RunMode runMode;
    private String jobEngineId;
    private JobMode jobType;
    private JobStatus jobStatus;
    private String errorMessage;

    private Long readRowCount;
    private Long writeRowCount;
    private Long readQps;
    private Long writeQps;
    private Long recordDelay;
    private String metricsStatus;
    private String sourceTable;
    private String sinkTable;

    private String cronExpression;
    private ScheduleStatusEnum scheduleStatus;
    private Date lastScheduleTime;
    private Date nextScheduleTime;

}

