package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;

public interface JobDefinitionHandler {

    boolean supports(BaseJobDefinitionCommand command);

    JobDefinitionAnalysisResult analyze(BaseJobDefinitionCommand command);

    String buildHoconConfig(BaseJobDefinitionCommand command);
}