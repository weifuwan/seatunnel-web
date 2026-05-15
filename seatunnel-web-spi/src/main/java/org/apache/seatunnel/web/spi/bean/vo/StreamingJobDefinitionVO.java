package org.apache.seatunnel.web.spi.bean.vo;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.ReleaseState;

import java.util.Date;

@Data
public class StreamingJobDefinitionVO {

    private Long id;

    private String jobName;

    private String jobDesc;

    private JobDefinitionMode mode;

    private JobMode jobType;

    private Long clientId;

    private Integer jobVersion;

    private ReleaseState releaseState;

    private String sourceType;

    private String sinkType;

    private String sourceTable;

    private String sinkTable;

    private Long sourceDatasourceId;

    private Long sinkDatasourceId;

    private Date createTime;

    private Date updateTime;

    /**
     * 最近一次运行实例 ID。
     */
    private Long instanceId;

    /**
     * 最近一次运行实例状态。
     *
     * INITIALIZING / CREATED / PENDING / RUNNING / FINISHED / FAILED / CANCELED ...
     */
    private String lastJobStatus;

    /**
     * 引擎侧 Job ID。
     */
    private Long engineJobId;

    /**
     * 最近一次提交时间。
     */
    private Date lastSubmitTime;

    /**
     * 最近一次开始时间。
     */
    private Date lastStartTime;

    /**
     * 最近一次结束时间。
     */
    private Date lastEndTime;

    /**
     * 最近一次错误信息。
     */
    private String lastErrorMessage;
}