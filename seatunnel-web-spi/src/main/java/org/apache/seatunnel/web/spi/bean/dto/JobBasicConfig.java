package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.enums.JobMode;

@Data
public class JobBasicConfig {
    
    /**
     * SCRIPT / GUIDE_SINGLE / GUIDE_MULTI
     */
    private JobDefinitionMode mode;

    /**
     * BATCH / STREAMING
     */
    private JobMode jobMode;

    private String jobName;

    private String jobDesc;

    private Long clientId;

    private Integer parallelism;
}
