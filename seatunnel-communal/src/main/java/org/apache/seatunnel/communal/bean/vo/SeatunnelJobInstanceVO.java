package org.apache.seatunnel.communal.bean.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.seatunnel.communal.enums.JobMode;
import org.apache.seatunnel.communal.enums.RunMode;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;

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

    private String logPath;
    private String jobConfig;

    @JsonFormat(pattern = "yyyy年MM月dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;

    @JsonFormat(pattern = "yyyy年MM月dd HH:mm:ss", timezone = "GMT+8")
    private Date endTime;

    private RunMode runMode;
    private String jobStatus;
    private String jobEngineId;
    private JobMode jobType;
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

