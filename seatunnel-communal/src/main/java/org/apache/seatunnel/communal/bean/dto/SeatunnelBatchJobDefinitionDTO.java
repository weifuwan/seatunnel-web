package org.apache.seatunnel.communal.bean.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import javax.validation.constraints.NotBlank;
import java.util.Date;

/**
 * Data Transfer Object for Seatunnel Job Definition
 * Contains job configuration and metadata information
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)

public class SeatunnelBatchJobDefinitionDTO extends BaseSeatunnelJobDefinitionDTO {

    /**
     * Whether to perform a full (whole) data synchronization.
     * true  - full synchronization
     * false - incremental or partial synchronization
     */
    private Boolean wholeSync;

    /**
     * Job definition information (configuration, pipeline definition, etc.)
     * Must not be empty
     */
    @NotBlank(message = "Job definition information cannot be empty")
    private String jobDefinitionInfo;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTimeStart;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTimeEnd;

    private String cronExpression;


    private String status;


    private String sourceTable;

    private String scheduleConfig;


    private String sinkTable;

    private Integer offset;

    @Override
    public String getJobDefinitionInfo() {
        return this.jobDefinitionInfo;
    }

    @Override
    public String getJobType() {
        return "BATCH";
    }
}