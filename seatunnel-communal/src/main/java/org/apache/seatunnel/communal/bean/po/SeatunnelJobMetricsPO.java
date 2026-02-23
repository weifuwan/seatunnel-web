package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("t_seatunnel_job_metrics")
public class SeatunnelJobMetricsPO {

    @TableId(value = "id", type = IdType.INPUT)
    private Long id;

    private Long jobDefinitionId;

    @TableField("job_instance_id")
    private Long jobInstanceId;

    @TableField("pipeline_id")
    private Integer pipelineId;

    @TableField("read_row_count")
    private long readRowCount;

    @TableField("write_row_count")
    private long writeRowCount;

    @TableField("source_table_names")
    private String sourceTableNames;

    @TableField("sink_table_names")
    private String sinkTableNames;

    @TableField("read_qps")
    private long readQps;

    @TableField("write_qps")
    private long writeQps;

    @TableField("record_delay")
    private long recordDelay;

    @TableField("create_time")
    private Date createTime;

    @TableField("update_time")
    private Date updateTime;
}
