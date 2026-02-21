package org.apache.seatunnel.communal.bean.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.apache.seatunnel.communal.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.communal.enums.JobMode;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;

import java.util.Date;

/**
 * 基础 Seatunnel 任务定义 DTO
 * 包含流式和批式任务的公共字段
 */
@Data
@ToString
@EqualsAndHashCode(callSuper = true)
public abstract class BaseSeatunnelJobDefinitionDTO extends PaginationBaseDTO {

    /**
     * 任务唯一标识
     */
    private Long id;

    /**
     * 任务名称
     */
    private String jobName;

    /**
     * 任务描述
     */
    private String jobDesc;

    private String jobType;

    /**
     * 任务并行度
     */
    private int parallelism;

    /**
     * 调度状态
     */
    private ScheduleStatusEnum scheduleStatus;

    /**
     * 任务版本号
     */
    private Integer jobVersion;

    /**
     * 客户端 ID
     */
    private Long clientId;

    /**
     * 数据源类型
     */
    private String sourceType;

    /**
     * 数据目标类型
     */
    private String sinkType;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 获取任务定义的具体信息
     * 由子类实现，返回各自特有的任务定义信息
     */
    public abstract String getJobDefinitionInfo();

    /**
     * 获取任务类型
     *
     * @return "stream" 或 "batch"
     */
    public abstract String getJobType();
}
