package org.apache.seatunnel.web.core.hocon;


import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;

/**
 * Resolve persisted job definition into executable save command.
 */
public interface JobDefinitionCommandResolver {

    /**
     * Resolve latest definition command by definition id.
     *
     * @param jobDefinitionId definition id
     * @return resolved save command
     */
    JobDefinitionSaveCommand resolve(Long jobDefinitionId);
}
