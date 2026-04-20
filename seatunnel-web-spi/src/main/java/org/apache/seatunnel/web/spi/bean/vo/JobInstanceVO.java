package org.apache.seatunnel.web.spi.bean.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;

import java.util.Date;

/**
 * Paged view object for job instance list.
 *
 * This VO aggregates data from:
 * - t_seatunnel_job_instance
 * - t_seatunnel_job_definition
 * - t_seatunnel_job_metrics
 * - t_seatunnel_job_schedule
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobInstanceVO {

    /**
     * Instance primary key.
     */
    private Long id;

    /**
     * Related job definition id.
     */
    private Long jobDefinitionId;

    /**
     * Client id from instance snapshot.
     */
    private Long clientId;

    /**
     * Run mode of instance.
     */
    private RunMode runMode;

    /**
     * Current job status.
     */
    private JobStatus jobStatus;

    /**
     * Trigger source.
     */
    private String triggerSource;

    /**
     * Retry count.
     */
    private Integer retryCount;

    /**
     * Engine-side job id.
     */
    private Long engineJobId;

    /**
     * Runtime config snapshot.
     */
    private String runtimeConfig;

    /**
     * Log path.
     */
    private String logPath;

    /**
     * Error message.
     */
    private String errorMessage;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date submitTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date endTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;

    /**
     * Job definition fields.
     */
    private String jobName;
    private String jobDesc;
    private String definitionMode;
    private JobMode jobType;
    private Long definitionClientId;
    private Integer parallelism;
    private Integer jobVersion;
    private String definitionStatus;
    private String sourceType;
    private String sinkType;
    private String sourceTable;
    private String sinkTable;

    /**
     * Aggregated metrics fields.
     */
    private Long readRowCount;
    private Long writeRowCount;
    private Long readQps;
    private Long writeQps;
    private Long readBytes;
    private Long writeBytes;
    private Long readBps;
    private Long writeBps;
    private Long intermediateQueueSize;
    private Long lagCount;
    private Double lossRate;
    private Long avgRowSize;
    private Long recordDelay;

    /**
     * Schedule fields.
     */
    private String cronExpression;
    private String scheduleStatus;
    private String scheduleConfig;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date lastScheduleTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date nextScheduleTime;
}