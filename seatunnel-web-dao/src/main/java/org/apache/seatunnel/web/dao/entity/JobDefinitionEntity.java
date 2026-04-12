package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.enums.JobMode;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("t_seatunnel_job_definition")
public class JobDefinitionEntity extends BaseEntity {

    private String jobName;
    private String jobDesc;

    private JobDefinitionMode mode;
    private JobMode jobType;

    private Long clientId;
    private Integer parallelism;

    private Integer jobVersion;
    private String status;

    private String sourceType;
    private String sinkType;
    private String sourceTable;
    private String sinkTable;
}
