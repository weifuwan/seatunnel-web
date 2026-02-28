package org.apache.seatunnel.communal.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.apache.seatunnel.communal.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.communal.enums.JobMode;
import org.apache.seatunnel.communal.enums.RunMode;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Job instance DTO representing a single execution of a job")
public class SeatunnelJobInstanceDTO extends PaginationBaseDTO {

    @Schema(
            description = "Job instance ID (unique identifier for this execution)",
            example = "10001",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;

    @Schema(
            description = "Job definition ID that this instance belongs to",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "2001"
    )
    private Long jobDefinitionId;

    @Schema(
            description = "Path to the execution log file",
            example = "/var/log/seatunnel/jobs/2024/01/15/instance_10001.log",
            nullable = true
    )
    private String logPath;

    @Schema(
            description = "Job configuration used for this execution",
            example = """
            {
                "source": {
                    "type": "MySQL",
                    "host": "localhost",
                    "port": 3306,
                    "database": "source_db",
                    "table": "users"
                },
                "sink": {
                    "type": "Hive",
                    "database": "target_db",
                    "table": "users_snapshot"
                }
            }
            """
    )
    private String jobConfig;

    @Schema(
            description = "Job execution start time",
            example = "2024-01-15 10:00:00",
            type = "string",
            format = "date-time"
    )
    private Date startTime;

    @Schema(
            description = "Run mode (MANUAL or SCHEDULED)",
            example = "MANUAL",
            allowableValues = {"MANUAL", "SCHEDULED"}
    )
    private RunMode runMode;

    @Schema(
            description = "Job execution end time",
            example = "2024-01-15 10:05:30",
            type = "string",
            format = "date-time",
            nullable = true
    )
    private Date endTime;

    @Schema(
            description = "Job type (BATCH or STREAMING)",
            example = "BATCH",
            allowableValues = {"BATCH", "STREAMING"}
    )
    private JobMode jobType;

    @Schema(
            description = "Error message if job failed",
            example = "Connection refused: MySQL server not available",
            nullable = true
    )
    private String errorMessage;

    @Schema(
            description = "Job execution status",
            example = "FINISHED",
            allowableValues = {"SUBMITTED", "RUNNING", "FINISHED", "FAILED", "CANCELLED", "SUSPENDED"}
    )
    private String jobStatus;

    @Schema(
            description = "Engine-specific job ID (Flink JobID, Spark application ID, etc.)",
            example = "application_1705318800000_1234",
            nullable = true
    )
    private String jobEngineId;

    // Pagination fields inherited from PaginationBaseDTO:
    // - pageNum: Page number (default: 1)
    // - pageSize: Page size (default: 10)
    // - orderBy: Sort field
    // - orderDirection: Sort direction (ASC/DESC)
}