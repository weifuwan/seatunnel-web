package org.apache.seatunnel.web.core.job.handler.multi;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.BatchJobEditCommandBuilder;
import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchGuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.BatchJobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobScheduleConfig;
import org.springframework.stereotype.Component;

@Component
public class BatchGuideMultiEditCommandBuilder implements BatchJobEditCommandBuilder {

    @Override
    public JobDefinitionMode mode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }

    @Override
    public JobDefinitionSaveCommand build(
            JobDefinitionEntity definition,
            JobDefinitionContentEntity contentEntity,
            JobScheduleConfig scheduleConfig) {

        BatchGuideMultiJobSaveCommand cmd = new BatchGuideMultiJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setSchedule(scheduleConfig);
        cmd.setContent(JSONUtils.parseObject(contentEntity.getDefinitionContent(), GuideMultiJobContent.class));
        cmd.setEnv(JSONUtils.parseObject(contentEntity.getEnvConfig(), BatchJobEnvConfig.class));
        return cmd;
    }

    private JobBasicConfig buildBasicConfig(JobDefinitionEntity definition) {
        JobBasicConfig basic = new JobBasicConfig();
        basic.setMode(definition.getMode());
        basic.setJobName(definition.getJobName());
        basic.setJobDesc(definition.getJobDesc());
        basic.setClientId(definition.getClientId());
        return basic;
    }
}