package org.apache.seatunnel.web.core.job.registry;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JobDefinitionModeHandlerRegistry {

    @Resource
    private List<JobDefinitionModeHandler> handlers;

    public JobDefinitionModeHandler getHandler(JobDefinitionMode mode) {
        return handlers.stream()
                .filter(handler -> handler.supports(mode))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No suitable handler found for mode=" + mode));
    }
}