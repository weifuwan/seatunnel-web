package org.apache.seatunnel.web.spi.bean.dto.streaming;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.command.GuideMultiJobContentCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.StreamingJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.CheckpointConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.StreamingJobEnvConfig;

@Data
@EqualsAndHashCode(callSuper = false)
public class StreamingGuideMultiJobSaveCommand implements StreamingJobSaveCommand, GuideMultiJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private GuideMultiJobContent content;

    private CheckpointConfig checkpoint;

    private StreamingJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }
}