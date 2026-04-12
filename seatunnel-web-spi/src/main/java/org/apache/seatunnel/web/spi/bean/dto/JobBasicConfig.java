package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.enums.JobMode;

@Data
public class JobBasicConfig {

    /**
     * 编辑时有值，新增时为空
     */
    private Long id;

    /**
     * SCRIPT / GUIDE_SINGLE / GUIDE_MULTI
     */
    private JobDefinitionMode mode;

    /**
     * BATCH / STREAMING
     */
    private JobMode jobType;

    private String jobName;

    private String jobDesc;

    private Long clientId;

    private Integer parallelism;
}
