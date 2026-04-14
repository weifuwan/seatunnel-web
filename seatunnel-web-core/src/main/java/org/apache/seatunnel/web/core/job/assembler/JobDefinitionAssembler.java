package org.apache.seatunnel.web.core.job.assembler;

import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.JobBasicConfig;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JobDefinitionAssembler {

    public JobDefinitionEntity create(JobDefinitionSaveCommand command,
                                      JobDefinitionAnalysisResult analysis) {
        JobBasicConfig basic = command.getBasic();

        JobDefinitionEntity build = JobDefinitionEntity.builder()
                .jobName(basic.getJobName())
                .jobDesc(basic.getJobDesc())
                .mode(command.getMode())
                .jobType(basic.getJobMode())
                .clientId(basic.getClientId())
                .parallelism(basic.getParallelism())
                .jobVersion(1)
                .sourceType(analysis.getSourceType())
                .sinkType(analysis.getSinkType())
                .sourceTable(analysis.getSourceTable())
                .sinkTable(analysis.getSinkTable())
                .build();
        build.initInsert();
        return build;
    }

    public void update(JobDefinitionEntity entity,
                       JobDefinitionSaveCommand command,
                       JobDefinitionAnalysisResult analysis,
                       Date now,
                       int nextVersion) {
        JobBasicConfig basic = command.getBasic();

        entity.setJobName(basic.getJobName());
        entity.setJobDesc(basic.getJobDesc());
        entity.setMode(command.getMode());
        entity.setJobType(basic.getJobMode());
        entity.setClientId(basic.getClientId());
        entity.setParallelism(basic.getParallelism());
        entity.setJobVersion(nextVersion);
        entity.setSourceType(analysis.getSourceType());
        entity.setSinkType(analysis.getSinkType());
        entity.setSourceTable(analysis.getSourceTable());
        entity.setSinkTable(analysis.getSinkTable());
        entity.setUpdateTime(now);
    }
}