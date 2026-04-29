package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

@Data
public class JobBasicConfig {

    private JobDefinitionMode mode;

    private String jobName;

    private String jobDesc;

    private Long clientId;

}
