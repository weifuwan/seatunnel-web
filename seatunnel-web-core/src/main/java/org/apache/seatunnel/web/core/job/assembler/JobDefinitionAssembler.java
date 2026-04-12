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
                                      JobDefinitionAnalysisResult analysis,
                                      Date now) {
        JobBasicConfig basic = command.getBasic();

        return JobDefinitionEntity.builder()
                .id(basic.getId())
                .jobName(basic.getJobName())
                .jobDesc(basic.getJobDesc())
                .mode(command.getMode())
                .jobType(basic.getJobType())
                .clientId(basic.getClientId())
                .parallelism(basic.getParallelism())
                .jobVersion(1)
                .sourceType(analysis.getSourceType())
                .sinkType(analysis.getSinkType())
                .sourceTable(analysis.getSourceTableJson())
                .sinkTable(analysis.getSinkTableJson())
                .createTime(now)
                .updateTime(now)
                .build();
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
        entity.setJobType(basic.getJobType());
        entity.setClientId(basic.getClientId());
        entity.setParallelism(basic.getParallelism());
        entity.setJobVersion(nextVersion);
        entity.setSourceType(analysis.getSourceType());
        entity.setSinkType(analysis.getSinkType());
        entity.setSourceTable(analysis.getSourceTableJson());
        entity.setSinkTable(analysis.getSinkTableJson());
        entity.setUpdateTime(now);
    }
}