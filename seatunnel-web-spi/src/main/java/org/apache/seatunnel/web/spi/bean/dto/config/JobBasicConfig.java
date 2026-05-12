package org.apache.seatunnel.web.spi.bean.dto.config;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.enums.JobRuntimeType;

@Data
public class JobBasicConfig {

    /**
     * 编辑模式：SCRIPT / GUIDE_SINGLE / GUIDE_MULTI
     */
    private JobDefinitionMode mode;

    /**
     * 运行类型：BATCH / STREAMING
     */
    private JobRuntimeType runtimeType;

    private String jobName;

    private String jobDesc;

    private Long clientId;
}