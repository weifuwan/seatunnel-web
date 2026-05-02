package org.apache.seatunnel.web.core.job.handler.single;


import com.google.protobuf.ServiceException;
import com.typesafe.config.Config;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.builder.HoconConfigBuilder;
import org.apache.seatunnel.web.core.dag.DagGraph;
import org.apache.seatunnel.web.core.utils.DagUtil;
import org.apache.seatunnel.web.spi.bean.dto.GuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.util.Map;

@Service
public class GuideSingleHoconBuildService {

    @Resource
    private HoconConfigBuilder hoconConfigBuilder;

    public String build(GuideSingleJobSaveCommand command) {
        if (command == null) {
            throw new RuntimeException( "command");
        }

        Map<String, Object> workflow = command.getWorkflow();
        if (MapUtils.isEmpty(workflow)) {
            throw new RuntimeException("workflow");
        }

        String dagJson = JSONUtils.toJsonString(workflow);
        if (StringUtils.isBlank(dagJson)) {
            throw new RuntimeException( "workflow");
        }

        DagGraph dagGraph = DagUtil.parseAndCheck(dagJson);
        return hoconConfigBuilder.build(dagGraph,  command.getEnv(), command.getSchedule());
    }
}
