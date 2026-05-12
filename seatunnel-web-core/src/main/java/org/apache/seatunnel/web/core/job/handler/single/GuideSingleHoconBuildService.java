package org.apache.seatunnel.web.core.job.handler.single;

import jakarta.annotation.Resource;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.builder.HoconConfigBuilder;
import org.apache.seatunnel.web.core.dag.DagGraph;
import org.apache.seatunnel.web.core.job.handler.JobRuntimeContext;
import org.apache.seatunnel.web.core.job.handler.JobRuntimeContextFactory;
import org.apache.seatunnel.web.core.utils.DagUtil;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class GuideSingleHoconBuildService {

    @Resource
    private HoconConfigBuilder hoconConfigBuilder;

    @Resource
    private JobRuntimeContextFactory runtimeContextFactory;

    public String build(Map<String, Object> workflow, JobDefinitionSaveCommand command) {
        if (command == null) {
            throw new IllegalArgumentException("command can not be null");
        }
        if (MapUtils.isEmpty(workflow)) {
            throw new IllegalArgumentException("workflow can not be empty");
        }

        String dagJson = JSONUtils.toJsonString(workflow);
        if (StringUtils.isBlank(dagJson)) {
            throw new IllegalArgumentException("workflow can not be blank");
        }

        DagGraph dagGraph = DagUtil.parseAndCheck(dagJson);

        JobRuntimeContext runtimeContext = runtimeContextFactory.create(command);

        return hoconConfigBuilder.build(
                dagGraph,
                runtimeContext.getEnv(),
                runtimeContext.getSchedule()
        );
    }
}