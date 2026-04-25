package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobScheduleConfig;

public interface JobDefinitionModeHandler {

    boolean supports(JobDefinitionMode mode);

    void validate(JobDefinitionSaveCommand command);

    JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command);

    String serializeDefinition(JobDefinitionSaveCommand command);

    String buildHoconConfig(JobDefinitionSaveCommand command);


    JobDefinitionSaveCommand buildEditCommand(
            JobDefinitionEntity definition,
            String definitionContent,
            JobScheduleConfig scheduleConfig
    );

    /**
     * 构建基础配置
     */
    default JobBasicConfig buildBasicConfig(JobDefinitionEntity definition) {
        if (definition == null) {
            return null;
        }

        JobBasicConfig basic = new JobBasicConfig();

        basic.setMode(definition.getMode());
        basic.setJobName(definition.getJobName());
        basic.setJobDesc(definition.getJobDesc());
        basic.setClientId(definition.getClientId());
        return basic;
    }
}