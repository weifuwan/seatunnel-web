package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.spi.bean.dto.pagination.PaginationBaseDTO;

@Data
@EqualsAndHashCode(callSuper = true)
public class StreamingJobDefinitionQueryDTO extends PaginationBaseDTO {


    private String jobName;

    private JobDefinitionMode mode;

    private JobMode jobType;

    private ReleaseState releaseState;

    private Long clientId;

    private String sourceType;

    private String sinkType;
}