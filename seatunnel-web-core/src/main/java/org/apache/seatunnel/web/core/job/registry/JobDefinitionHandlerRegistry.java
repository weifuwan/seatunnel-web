package org.apache.seatunnel.web.core.job.registry;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionHandler;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JobDefinitionHandlerRegistry {

    @Resource
    private List<JobDefinitionHandler> handlers;

    public JobDefinitionHandler getHandler(BaseJobDefinitionCommand command) {
        return handlers.stream()
                .filter(handler -> handler.supports(command))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        String.format("No suitable JobDefinitionHandler found for jobType=%s, syncMode=%s",
                                command.getJobType(), command.getSyncMode())
                ));
    }
}