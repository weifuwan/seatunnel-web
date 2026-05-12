package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.enums.JobRuntimeType;

public interface JobEditCommandBuilder<D, C> {

    JobRuntimeType runtimeType();

    JobDefinitionMode mode();

    JobDefinitionSaveCommand build(D definition, C content, Object runtimeConfig);
}