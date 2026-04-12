package org.apache.seatunnel.web.spi.bean.dto;


import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = false)
public class GuideSingleJobSaveCommand implements JobDefinitionSaveCommand {

    private Long id;

    private JobBasicConfig basic;

    private Map<String, Object> workflow;

    private JobScheduleConfig schedule;

    @Override
    public JobDefinitionMode getMode() {
        return JobDefinitionMode.GUIDE_SINGLE;
    }
}
