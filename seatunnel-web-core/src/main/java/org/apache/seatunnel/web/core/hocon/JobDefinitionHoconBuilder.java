package org.apache.seatunnel.web.core.hocon;

import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;

/**
 * Build executable hocon config from job definition command.
 */
public interface JobDefinitionHoconBuilder {

    /**
     * Build hocon config for the given job definition command.
     *
     * @param command job definition command
     * @return executable hocon config
     */
    String build(JobDefinitionSaveCommand command);
}
