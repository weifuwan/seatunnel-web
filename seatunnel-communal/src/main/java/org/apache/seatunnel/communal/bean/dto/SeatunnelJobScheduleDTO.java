package org.apache.seatunnel.communal.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.communal.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;

import java.sql.Date;

/**
 * Job Schedule Association Entity
 * Used to associate job definitions with Quartz scheduling information
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Job schedule DTO")
public class SeatunnelJobScheduleDTO extends PaginationBaseDTO {

    /**
     * Primary key
     */
    @Schema(
            description = "Schedule ID (primary key)",
            example = "1001",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;

    /**
     * Job definition ID
     * References the primary key ID of the job definition table
     */
    @Schema(
            description = "Job definition ID",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "2001"
    )
    private Long jobDefinitionId;

    /**
     * Cron expression
     * Defines the scheduling rule for job execution
     * Example: 0 0/5 * * * ? means execute every 5 minutes
     */
    @Schema(
            description = "Cron expression for scheduling",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "0 0/5 * * * ?",
            pattern = "cron expression with 6 or 7 fields"
    )
    private String cronExpression;

    /**
     * Schedule status
     */
    @Schema(
            description = "Schedule status",
            example = "NORMAL",
            allowableValues = {"NORMAL", "PAUSED", "COMPLETE", "ERROR", "BLOCKED", "NONE"}
    )
    private ScheduleStatusEnum scheduleStatus;

    /**
     * Last schedule time
     * The last time the job was triggered
     */
    @Schema(
            description = "Last schedule execution time",
            example = "2024-01-15",
            type = "string",
            format = "date"
    )
    private Date lastScheduleTime;

    /**
     * Next schedule time
     * The next scheduled trigger time
     */
    @Schema(
            description = "Next scheduled execution time",
            example = "2024-01-16",
            type = "string",
            format = "date"
    )
    private Date nextScheduleTime;

    /**
     * Schedule configuration information
     * Stores additional scheduling configuration in JSON format
     * Can include: misfire policy, priority, job parameters, etc.
     */
    @Schema(
            description = "Schedule configuration in JSON format",
            example = """
            {
                "misfirePolicy": "DO_NOTHING",
                "priority": 5,
                "jobParameters": {
                    "retryCount": 3,
                    "timeout": 3600
                },
                "timezone": "Asia/Shanghai",
                "description": "Daily data sync job"
            }
            """,
            nullable = true
    )
    private String scheduleConfig;

}