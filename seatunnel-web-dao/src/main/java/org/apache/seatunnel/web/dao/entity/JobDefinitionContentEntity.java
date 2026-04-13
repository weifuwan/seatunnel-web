package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("t_seatunnel_job_definition_content")
public class JobDefinitionContentEntity {

    private Long id;
    private Long jobDefinitionId;
    private Integer version;
    private JobDefinitionMode mode;
    private Integer contentSchemaVersion;
    private String definitionContent;
    private Date createTime;
}
