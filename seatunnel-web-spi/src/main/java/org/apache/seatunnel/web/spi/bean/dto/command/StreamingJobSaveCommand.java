package org.apache.seatunnel.web.spi.bean.dto.command;

import org.apache.seatunnel.web.spi.enums.JobRuntimeType;

public interface StreamingJobSaveCommand extends JobDefinitionSaveCommand {


    @Override
    default JobRuntimeType getRuntimeType() {
        return JobRuntimeType.STREAMING;
    }
}