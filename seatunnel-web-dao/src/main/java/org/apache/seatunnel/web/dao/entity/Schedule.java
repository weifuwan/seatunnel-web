package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.ScheduleStatusEnum;

import java.util.Date;



@Data
@EqualsAndHashCode(callSuper = true)
@TableName("t_seatunnel_job_schedule")
public class Schedule extends BaseEntity {

    /**
     * 任务定义ID
     */
    private Long jobDefinitionId;
    /**
     * Cron表达式
     * 定义任务调度时间规则的Cron表达式
     * 例如：0 0/5 * * * ? 表示每5分钟执行一次
     */
    private String cronExpression;

    /**
     * 调度状态
     */
    private ScheduleStatusEnum scheduleStatus;

    /**
     * 最后调度时间
     * 最后一次触发调度的时间
     */
    private Date lastScheduleTime;

    /**
     * 下次调度时间
     * 预计下一次触发调度的时间
     */
    private Date nextScheduleTime;

    /**
     * 调度配置信息
     * 存储调度相关的额外配置信息，JSON格式
     * 可包含：错过触发策略、优先级、任务参数等
     */
    private String scheduleConfig;
}