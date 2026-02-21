package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@TableName("t_seatunnel_stream_job_definition")
public class SeatunnelStreamJobDefinitionPO {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String jobName;

    private String jobDesc;

    private String jobDefinitionInfo;

    private String pluginName;

    private String jobType;

    private Integer jobVersion;

    private Long clientId;

    private int parallelism;

    private String scheduleStatus;

    private String sourceType;

    private String sourceTable;

    private String sinkType;

    private String sinkTable;

    private Date createTime;

    private Date updateTime;
}
