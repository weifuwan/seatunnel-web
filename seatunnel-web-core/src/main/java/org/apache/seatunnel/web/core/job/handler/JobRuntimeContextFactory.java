package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.spi.bean.dto.command.BatchJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.StreamingJobSaveCommand;
import org.springframework.stereotype.Component;

@Component
public class JobRuntimeContextFactory {

    public JobRuntimeContext create(JobDefinitionSaveCommand command) {
        if (command == null) {
            throw new IllegalArgumentException("command can not be null");
        }

        JobRuntimeContext.JobRuntimeContextBuilder builder = JobRuntimeContext.builder()
                .runtimeType(command.getRuntimeType())
                .env(command.getEnv());

        if (command instanceof BatchJobSaveCommand) {
            BatchJobSaveCommand batchCommand = (BatchJobSaveCommand) command;
            builder.schedule(batchCommand.getSchedule());
        }

        if (command instanceof StreamingJobSaveCommand) {
            StreamingJobSaveCommand streamingCommand = (StreamingJobSaveCommand) command;
        }

        return builder.build();
    }
}