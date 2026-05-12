package org.apache.seatunnel.web.core.job.registry;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.core.job.handler.StreamingJobEditCommandBuilder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StreamingJobEditCommandBuilderRegistry {

    @Resource
    private List<StreamingJobEditCommandBuilder> builders;

    public StreamingJobEditCommandBuilder getBuilder(JobDefinitionMode mode) {
        return builders.stream()
                .filter(builder -> builder.mode() == mode)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No streaming edit command builder found for mode=" + mode));
    }
}