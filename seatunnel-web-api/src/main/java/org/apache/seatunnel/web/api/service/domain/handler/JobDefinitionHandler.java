package org.apache.seatunnel.web.api.service.domain.handler;

import org.apache.seatunnel.web.api.service.domain.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;

public interface JobDefinitionHandler {

    boolean supports(BaseJobDefinitionCommand command);

    JobDefinitionAnalysisResult analyze(BaseJobDefinitionCommand command);

    String buildHoconConfig(BaseJobDefinitionCommand command);
}