package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@TableName("t_seatunnel_job_definition")
public class BatchJobDefinition {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String jobName;

    private String jobDesc;

    private String jobDefinitionInfo;

    private Integer jobVersion;

    private Long clientId;

    private Integer parallelism;

    private JobMode jobType;

    private SyncModeEnum syncMode;

    private String sourceType;

    private String sourceTable;

    private String sinkType;

    private String sinkTable;

    private Date createTime;

    private Date updateTime;
}
