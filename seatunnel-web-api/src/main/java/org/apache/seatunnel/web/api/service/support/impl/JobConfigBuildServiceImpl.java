package org.apache.seatunnel.web.api.service.support.impl;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.builder.HoconConfigBuilder;
import org.apache.seatunnel.web.api.dag.DagGraph;
import org.apache.seatunnel.web.api.dag.StreamDagAssembler;
import org.apache.seatunnel.web.api.dag.WholeSyncDagAssembler;
import org.apache.seatunnel.web.api.service.support.JobConfigBuildService;
import org.apache.seatunnel.web.api.utils.DagUtil;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.SyncModeEnum;
import org.springframework.stereotype.Service;

@Service
public class JobConfigBuildServiceImpl implements JobConfigBuildService {

    @Resource
    private HoconConfigBuilder configBuilder;

    @Override
    public String buildJobConfig(BaseJobDefinitionCommand dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Job definition dto cannot be null");
        }

        if (JobMode.STREAMING.equals(dto.getJobType())) {
            return buildStreamingConfig(dto);
        }

        if (SyncModeEnum.WHOLE_SYNC.equals(dto.getSyncMode())) {
            return buildWholeSyncConfig(dto);
        }

        return buildBatchDagConfig(dto);
    }

    @Override
    public String buildBatchDagConfig(BaseJobDefinitionCommand dto) {
        return buildConfig(dto.getJobDefinitionInfo(), dto);
    }

    @Override
    public String buildWholeSyncConfig(BaseJobDefinitionCommand dto) {
        String dagJson = WholeSyncDagAssembler.assemble(
                dto.getJobDefinitionInfo(),
                dto.getJobType().name()
        );
        return buildConfig(dagJson, dto);
    }

    @Override
    public String buildStreamingConfig(BaseJobDefinitionCommand dto) {
        String dagJson = StreamDagAssembler.assemble(
                dto.getJobDefinitionInfo(),
                dto.getJobType().name()
        );
        return buildConfig(dagJson, dto);
    }

    private String buildConfig(String dagJson, BaseJobDefinitionCommand dto) {
        DagGraph dagGraph = DagUtil.parseAndCheck(dagJson);
        return configBuilder.build(dagGraph, dto);
    }
}