package org.apache.seatunnel.web.core.job.handler.script;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.job.handler.StreamingJobEditCommandBuilder;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.CheckpointConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.ScriptJobContent;
import org.apache.seatunnel.web.spi.bean.dto.config.StreamingJobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class StreamingScriptEditCommandBuilder implements StreamingJobEditCommandBuilder {

    @Override
    public JobDefinitionMode mode() {
        return JobDefinitionMode.SCRIPT;
    }

    @Override
    public JobDefinitionSaveCommand build(
            StreamingJobDefinitionEntity definition,
            StreamingJobDefinitionContentEntity contentEntity) {

        StreamingScriptJobSaveCommand cmd = new StreamingScriptJobSaveCommand();
        cmd.setId(definition.getId());
        cmd.setBasic(buildBasicConfig(definition));
        cmd.setContent(JSONUtils.parseObject(contentEntity.getDefinitionContent(), ScriptJobContent.class));
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