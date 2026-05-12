package org.apache.seatunnel.web.spi.bean.dto.streaming;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.command.ScriptJobContentCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.StreamingJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.CheckpointConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.ScriptJobContent;
import org.apache.seatunnel.web.spi.bean.dto.config.StreamingJobEnvConfig;

@Data
@EqualsAndHashCode(callSuper = false)
public class StreamingScriptJobSaveCommand implements StreamingJobSaveCommand, ScriptJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private ScriptJobContent content;

    private CheckpointConfig checkpoint;

    private StreamingJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.SCRIPT;
    }
}