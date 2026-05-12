package org.apache.seatunnel.web.spi.bean.dto.streaming;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.command.GuideSingleJobContentCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.StreamingJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.CheckpointConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.StreamingJobEnvConfig;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = false)
public class StreamingGuideSingleJobSaveCommand implements StreamingJobSaveCommand, GuideSingleJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private Map<String, Object> workflow;

    private CheckpointConfig checkpoint;

    private StreamingJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_SINGLE;
    }
}