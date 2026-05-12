package org.apache.seatunnel.web.core.job.handler.multi;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.StreamingJobEditCommandBuilder;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.CheckpointConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.StreamingJobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideMultiJobSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class StreamingGuideMultiEditCommandBuilder implements StreamingJobEditCommandBuilder {

    @Override
    public JobDefinitionMode mode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }

    @Override
    public JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity) {

        StreamingGuideMultiJobSaveCommand cmd = new StreamingGuideMultiJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setContent(JSONUtils.parseObject(contentEntity.getDefinitionContent(), GuideMultiJobContent.class));
        cmd.setEnv(JSONUtils.parseObject(contentEntity.getEnvConfig(), StreamingJobEnvConfig.class));
        return cmd;
    }

    private JobBasicConfig buildBasicConfig(StreamingJobDefinitionEntity definition) {
        JobBasicConfig basic = new JobBasicConfig();
        basic.setMode(definition.getMode());
        basic.setJobName(definition.getJobName());
        basic.setJobDesc(definition.getJobDesc());
        basic.setClientId(definition.getClientId());
        return basic;
    }
}