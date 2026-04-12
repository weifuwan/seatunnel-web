package org.apache.seatunnel.web.spi.bean.dto;


import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ScriptJobSaveCommand implements JobDefinitionSaveCommand {

    private Long id;

    private JobBasicConfig basic;

    private ScriptJobContent content;

    private JobScheduleConfig schedule;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.SCRIPT;
    }
}
