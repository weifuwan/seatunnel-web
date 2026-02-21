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
@TableName("t_seatunnel_job_definition")
public class SeatunnelBatchJobDefinitionPO {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String jobName;

    private String jobDesc;

    private String jobDefinitionInfo;

    private Integer jobVersion;

    private Long clientId;

    private boolean wholeSync;

    private int parallelism;

    private String sourceType;
    private String sourceTable;

    private String sinkType;
    private String sinkTable;

    private Date createTime;

    private Date updateTime;
}
