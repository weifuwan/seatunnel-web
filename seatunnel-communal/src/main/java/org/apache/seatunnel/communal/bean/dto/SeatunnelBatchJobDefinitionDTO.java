package org.apache.seatunnel.communal.bean.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.constraints.NotBlank;
import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Batch job definition DTO")
public class SeatunnelBatchJobDefinitionDTO extends BaseSeatunnelJobDefinitionDTO {

    /**
     * Whether to perform a full (whole) data synchronization.
     * true  - full synchronization
     * false - incremental or partial synchronization
     */
    @Schema(
            description = "Full synchronization flag: true - full sync, false - incremental/partial sync",
            example = "true",
            defaultValue = "false"
    )
    private Boolean wholeSync;

    /**
     * Job definition information (configuration, pipeline definition, etc.)
     * Must not be empty
     */
    @NotBlank(message = "Job definition information cannot be empty")
    @Schema(
            description = "Job configuration in HOCON/JSON format",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = """
            {
              "source": {
                "type": "MySQL",
                "host": "localhost",
                "port": 3306,
                "database": "source_db",
                "table": "users"
              },
              "transform": [
                {
                  "type": "sql",
                  "sql": "SELECT id, name, age FROM source"
                }
              ],
              "sink": {
                "type": "Hive",
                "database": "target_db",
                "table": "users_snapshot"
              }
            }
            """
    )
    private String jobDefinitionInfo;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @Schema(
            description = "Query start time (inclusive)",
            example = "2024-01-01 00:00:00",
            type = "string",
            format = "date-time"
    )
    private Date createTimeStart;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @Schema(
            description = "Query end time (inclusive)",
            example = "2024-01-31 23:59:59",
            type = "string",
            format = "date-time"
    )
    private Date createTimeEnd;

    @Schema(
            description = "Cron expression for scheduled execution",
            example = "0 0 2 * * ?",
            nullable = true
    )
    private String cronExpression;

    @Schema(
            description = "Job status",
            example = "ENABLED",
            allowableValues = {"ENABLED", "DISABLED", "DELETED"}
    )
    private String status;

    @Schema(
            description = "Source table name for filtering",
            example = "users"
    )
    private String sourceTable;

    @Schema(
            description = "Schedule configuration in JSON format",
            example = "{\"type\":\"cron\",\"timezone\":\"Asia/Shanghai\"}",
            nullable = true
    )
    private String scheduleConfig;

    @Schema(
            description = "Sink table name for filtering",
            example = "users_snapshot"
    )
    private String sinkTable;

    @Schema(
            description = "Pagination offset",
            example = "0",
            defaultValue = "0"
    )
    private Integer offset;

    @Override
    @Schema(hidden = true)
    public String getJobDefinitionInfo() {
        return this.jobDefinitionInfo;
    }

    @Override
    @Schema(description = "Job type", example = "BATCH", allowableValues = {"BATCH"})
    public String getJobType() {
        return "BATCH";
    }
}