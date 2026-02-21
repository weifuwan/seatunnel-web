package org.apache.seatunnel.communal.bean.dto;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.*;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class SeatunnelStreamJobDefinitionDTO extends BaseSeatunnelJobDefinitionDTO {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String jobDefinitionInfo;

    private Long checkpointInterval;

    private Long checkpointTimeout;

    private String pluginName;

    private String jobType;

    private String sourceTable;

    private String sinkTable;

    private Date createTime;

    private Date updateTime;

    @Override
    public String getJobDefinitionInfo() {
        return this.jobDefinitionInfo;
    }

    @Override
    public String getJobType() {
        return this.jobType;
    }
}