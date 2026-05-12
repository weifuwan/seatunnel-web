package org.apache.seatunnel.web.spi.bean.dto.batch;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.spi.bean.dto.command.BatchJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.ScriptJobContentCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.BatchJobEnvConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.JobScheduleConfig;
import org.apache.seatunnel.web.spi.bean.dto.config.ScriptJobContent;

@Data
@EqualsAndHashCode(callSuper = false)
public class BatchScriptJobSaveCommand implements BatchJobSaveCommand, ScriptJobContentCommand {

    private Long id;

    private JobBasicConfig basic;

    private ScriptJobContent content;

    private JobScheduleConfig schedule;

    private BatchJobEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.SCRIPT;
    }
}