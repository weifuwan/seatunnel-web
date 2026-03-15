package org.apache.seatunnel.web.common.bean.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
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

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@TableName("t_seatunnel_job_instance")
public class SeatunnelJobInstancePO {

    @TableId(type = IdType.INPUT)
    private Long id;

    private Long jobDefinitionId;

    private JobMode jobType;

    private SyncModeEnum syncMode;

    private RunMode runMode;

    private JobStatus jobStatus;

    /**
     * Executable runtime config snapshot
     */
    private String runtimeConfig;

    /**
     * Engine-side job id, keep string for compatibility
     */
    private Long engineJobId;

    private String engineType;

    private String engineEndpoint;

    private String logPath;

    private String errorMessage;

    private String triggerSource;

    private Integer retryCount;

    private Integer configVersion;

    private String configChecksum;

    private Date createTime;

    private Date submitTime;

    private Date startTime;

    private Date lastHeartbeatTime;

    private Date lastStatusSyncTime;

    private Date endTime;

    private Date updateTime;

    private String extraInfo;
}