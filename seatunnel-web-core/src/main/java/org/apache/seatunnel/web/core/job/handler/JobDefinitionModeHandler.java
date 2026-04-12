package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;

public interface JobDefinitionModeHandler {

    boolean supports(JobDefinitionMode mode);

    void validate(JobDefinitionSaveCommand command);

    JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command);

    String serializeDefinition(JobDefinitionSaveCommand command);

    String buildHoconConfig(JobDefinitionSaveCommand command);
}