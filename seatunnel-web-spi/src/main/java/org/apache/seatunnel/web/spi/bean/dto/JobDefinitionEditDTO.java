package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

import java.util.Map;

@Data
public class JobDefinitionEditDTO {

    private Long id;

    /**
     * GUIDE_SINGLE / GUIDE_MULTI / SCRIPT
     */
    private JobDefinitionMode mode;

    /**
     * 基础配置，来自 job_definition 主表
     */
    private JobBasicConfig basic;

    /**
     * 可视化模式下的工作流原始结构
     */
    private Map<String, Object> workflow;

    /**
     * 脚本模式下的脚本内容
     */
    private String scriptContent;

    /**
     * 调度配置，来自 job_schedule 表
     */
    private JobScheduleConfig schedule;
}