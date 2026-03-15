package org.apache.seatunnel.web.common.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.apache.seatunnel.web.common.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;

@Data
@ToString
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Base job definition command")
public abstract class BaseJobDefinitionCommand extends PaginationBaseDTO {

    @Schema(description = "Job definition ID", example = "1001")
    private Long id;

    @Schema(description = "Job name", example = "mysql_to_kafka_sync")
    private String jobName;

    @Schema(description = "Job description")
    private String jobDesc;

    @Schema(description = "Parallelism", example = "1")
    private Integer parallelism;

    @Schema(description = "Client ID", example = "10001")
    private Long clientId;

    @Schema(description = "Job version", example = "1")
    private Integer jobVersion;

    @Schema(description = "Job definition info in json")
    private String jobDefinitionInfo;

    @Schema(description = "Job type")
    private JobMode jobType;

    @Schema(description = "Sync mode")
    private SyncModeEnum syncMode;
}
