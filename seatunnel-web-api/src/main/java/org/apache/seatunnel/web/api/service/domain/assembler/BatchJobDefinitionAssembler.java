package org.apache.seatunnel.web.api.service.domain.assembler;

import org.apache.seatunnel.web.api.service.domain.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.common.bean.po.SeatunnelBatchJobDefinitionPO;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class BatchJobDefinitionAssembler {

    public SeatunnelBatchJobDefinitionPO create(SeatunnelBatchJobDefinitionDTO dto,
                                                JobDefinitionAnalysisResult analysis,
                                                Date now) {
        return SeatunnelBatchJobDefinitionPO.builder()
                .id(dto.getId())
                .jobName(dto.getJobName())
                .jobDesc(dto.getJobDesc())
                .jobDefinitionInfo(analysis.getNormalizedJobDefinitionInfo())
                .jobVersion(1)
                .clientId(dto.getClientId())
                .parallelism(dto.getParallelism())
                .jobType(dto.getJobType())
                .syncMode(dto.getSyncMode())
                .sourceType(analysis.getSourceType())
                .sourceTable(analysis.getSourceTableJson())
                .sinkType(analysis.getSinkType())
                .sinkTable(analysis.getSinkTableJson())
                .createTime(now)
                .updateTime(now)
                .build();
    }

    public void update(SeatunnelBatchJobDefinitionPO po,
                       SeatunnelBatchJobDefinitionDTO dto,
                       JobDefinitionAnalysisResult analysis,
                       Date now) {
        po.setJobName(dto.getJobName());
        po.setJobDesc(dto.getJobDesc());
        po.setJobDefinitionInfo(analysis.getNormalizedJobDefinitionInfo());
        po.setClientId(dto.getClientId());
        po.setParallelism(dto.getParallelism());
        po.setJobType(dto.getJobType());
        po.setSyncMode(dto.getSyncMode());
        po.setSourceType(analysis.getSourceType());
        po.setSourceTable(analysis.getSourceTableJson());
        po.setSinkType(analysis.getSinkType());
        po.setSinkTable(analysis.getSinkTableJson());
        po.setJobVersion(po.getJobVersion() == null ? 1 : po.getJobVersion() + 1);
        po.setUpdateTime(now);
    }
}