package org.apache.seatunnel.web.spi.bean.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;

import java.util.Date;

/**
 * Job instance view object.
 *
 * Keep this VO focused on instance-level fields only.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class JobInstanceVO {

    /**
     * Instance id.
     */
    private Long id;

    /**
     * Related job definition id.
     */
    private Long jobDefinitionId;

    private Long clientId;

    /**
     * Job name snapshot.
     */
    private String jobName;

    /**
     * Job description snapshot.
     */
    private String jobDesc;

    /**
     * Job config version snapshot.
     */
    private Integer jobVersion;

    /**
     * Sync mode snapshot.
     */
    private SyncModeEnum syncMode;

    /**
     * Job type.
     */
    private JobMode jobType;

    /**
     * Run mode.
     */
    private RunMode runMode;

    /**
     * Current job status.
     */
    private JobStatus jobStatus;

    /**
     * Executable runtime config snapshot.
     */
    private String runtimeConfig;

    /**
     * Engine-side job id.
     */
    private Long engineJobId;

    /**
     * Job log path.
     */
    private String logPath;

    /**
     * Failure reason if execution failed.
     */
    private String errorMessage;

    /**
     * Retry count.
     */
    private Integer retryCount;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date startTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date endTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;
}