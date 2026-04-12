package org.apache.seatunnel.web.spi.bean.dto;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

public interface JobDefinitionSaveCommand {

    Long getId();

    JobDefinitionMode getMode();

    JobBasicConfig getBasic();

    JobScheduleConfig getSchedule();
}
