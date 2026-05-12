package org.apache.seatunnel.web.core.job.handler.single;

import com.fasterxml.jackson.core.type.TypeReference;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.StreamingJobEditCommandBuilder;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.CheckpointConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.StreamingJobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class StreamingGuideSingleEditCommandBuilder implements StreamingJobEditCommandBuilder {

    @Override
    public JobDefinitionMode mode() {
        return JobDefinitionMode.GUIDE_SINGLE;
    }

    @Override
    public JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity) {

        StreamingGuideSingleJobSaveCommand cmd = new StreamingGuideSingleJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setEnv(JSONUtils.parseObject(contentEntity.getEnvConfig(), StreamingJobEnvConfig.class));

        Map<String, Object> workflow = JSONUtils.parseObject(
                contentEntity.getDefinitionContent(),
                new TypeReference<Map<String, Object>>() {
                }
        );

        cmd.setWorkflow(workflow == null ? Collections.emptyMap() : workflow);
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