package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;

public interface StreamingJobEditCommandBuilder {

    JobDefinitionMode mode();

    JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity
    );
}