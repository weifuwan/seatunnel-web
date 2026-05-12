package org.apache.seatunnel.web.spi.bean.dto.batch;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.command.BatchJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.GuideMultiJobContentCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.BatchJobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobScheduleConfig;

@Data
@EqualsAndHashCode(callSuper = false)
public class BatchGuideMultiJobSaveCommand implements BatchJobSaveCommand, GuideMultiJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private GuideMultiJobContent content;

    private JobScheduleConfig schedule;

    private BatchJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }
}