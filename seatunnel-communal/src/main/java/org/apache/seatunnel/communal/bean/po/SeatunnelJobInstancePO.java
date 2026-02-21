package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import org.apache.seatunnel.communal.enums.JobMode;
import org.apache.seatunnel.communal.enums.RunMode;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@TableName("t_seatunnel_job_instance")
public class SeatunnelJobInstancePO {

    /**
     * Unique identifier for the job instance
     */
    @TableId(type = IdType.INPUT)
    private Long id;

    /**
     * Job definition ID, foreign key to t_seatunnel_job_definition.id
     */
    private Long jobDefinitionId;

    private String logPath;

    /**
     * Job configuration
     */
    private String jobConfig;

    /**
     * Start timestamp
     */
    private Date startTime;

    private RunMode runMode;

    private Date endTime;

    private JobMode jobType;

    private String errorMessage;

    private String jobStatus;

    private String jobEngineId;

}
