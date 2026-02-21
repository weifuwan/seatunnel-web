package org.apache.seatunnel.communal.bean.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.apache.seatunnel.communal.enums.RunMode;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SeatunnelBatchJobDefinitionVO {

    private Long id;

    private String jobName;

    private String jobDesc;

    private Long duration;

    private Long qps;

    private String jobDefinitionInfo;

    private Integer jobVersion;

    private Long clientId;

    private boolean wholeSync;

    private int parallelism;

    private String sourceType;
    private String sourceTable;


    private String sinkType;
    private String sinkTable;

    private String lastJobStatus;
    private Date lastStartTime;
    private Date lastEndTime;
    private String errorMessage;
    private RunMode runMode;

    private Long readRowCount;
    private Long writeRowCount;
    private Long readQps;
    private Long writeQps;
    private Long recordDelay;


    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;

    private String scheduleId;
    private String cronExpression;
    private ScheduleStatusEnum scheduleStatus;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date lastScheduleTime;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date nextScheduleTime;
    private String scheduleConfig;

}
