package org.apache.seatunnel.web.spi.bean.dto;


import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

@Data
@EqualsAndHashCode(callSuper = false)
public class GuideMultiJobSaveCommand implements JobDefinitionSaveCommand {

    private Long id;

    private JobBasicConfig basic;

    private GuideMultiJobContent content;

    private JobScheduleConfig schedule;

    private GuideMultiEnvConfig env;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_MULTI;
    }
}
