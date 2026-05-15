package org.apache.seatunnel.web.core.hocon;

import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;

/**
 * Resolve persisted streaming job definition data into save command.
 */
public interface StreamingJobDefinitionCommandResolver {

    JobDefinitionSaveCommand resolve(Long jobDefinitionId);
}