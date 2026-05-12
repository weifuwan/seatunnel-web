package org.apache.seatunnel.web.spi.bean.dto.command;


import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobEnvConfig;
import org.apache.seatunnel.web.spi.enums.JobRuntimeType;

public interface JobDefinitionSaveCommand {

    Long getId();

    JobDefinitionMode getMode();

    JobRuntimeType getRuntimeType();

    JobBasicConfig getBasic();

    JobEnvConfig getEnv();
}