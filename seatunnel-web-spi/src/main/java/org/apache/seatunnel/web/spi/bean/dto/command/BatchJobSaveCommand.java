package org.apache.seatunnel.web.spi.bean.dto.command;

import org.apache.seatunnel.web.spi.bean.dto.config.JobScheduleConfig;
import org.apache.seatunnel.web.spi.enums.JobRuntimeType;

public interface BatchJobSaveCommand extends JobDefinitionSaveCommand {

    JobScheduleConfig getSchedule();

    @Override
    default JobRuntimeType getRuntimeType() {
        return JobRuntimeType.BATCH;
    }
}