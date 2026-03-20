package org.apache.seatunnel.web.core.job.assembler;

import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinition;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class StreamingJobDefinitionAssembler {

    public StreamingJobDefinition create(SeatunnelStreamingJobDefinitionDTO dto,
                                     JobDefinitionAnalysisResult analysis,
                                     Date now) {
        return StreamingJobDefinition.builder()
                .id(dto.getId())
                .jobName(dto.getJobName())
                .jobDesc(dto.getJobDesc())
                .jobDefinitionInfo(analysis.getNormalizedJobDefinitionInfo())
                .jobVersion(1)
                .parallelism(dto.getParallelism())
                .jobType(dto.getJobType())
                .sourceType(analysis.getSourceType())
                .sourceTable(analysis.getSourceTableJson())
                .sinkType(analysis.getSinkType())
                .sinkTable(analysis.getSinkTableJson())
                .createTime(now)
                .updateTime(now)
                .build();
    }

    public void update(StreamingJobDefinition po,
                       SeatunnelStreamingJobDefinitionDTO dto,
                       JobDefinitionAnalysisResult analysis,
                       Date now) {
        po.setJobName(dto.getJobName());
        po.setJobDesc(dto.getJobDesc());
        po.setJobDefinitionInfo(analysis.getNormalizedJobDefinitionInfo());
        po.setParallelism(dto.getParallelism());
        po.setJobType(dto.getJobType());
        po.setSourceType(analysis.getSourceType());
        po.setSourceTable(analysis.getSourceTableJson());
        po.setSinkType(analysis.getSinkType());
        po.setSinkTable(analysis.getSinkTableJson());
        po.setJobVersion(po.getJobVersion() == null ? 1 : po.getJobVersion() + 1);
        po.setUpdateTime(now);
    }
}
