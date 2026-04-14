//package org.apache.seatunnel.web.core.hocon;
//
//import jakarta.annotation.Resource;
//import org.apache.seatunnel.web.common.enums.JobMode;
//import org.apache.seatunnel.web.common.enums.SyncModeEnum;
//import org.apache.seatunnel.web.core.builder.HoconConfigBuilder;
//import org.apache.seatunnel.web.core.dag.DagGraph;
//import org.apache.seatunnel.web.core.dag.StreamDagAssembler;
//import org.apache.seatunnel.web.core.dag.WholeSyncDagAssembler;
//import org.apache.seatunnel.web.core.utils.DagUtil;
//import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
//import org.springframework.stereotype.Service;
//
//@Service
//public class JobConfigBuild  {
//
//    @Resource
//    private HoconConfigBuilder configBuilder;
//
//    public String buildJobConfig(BaseJobDefinitionCommand dto) {
//        if (dto == null) {
//            throw new IllegalArgumentException("Job definition dto cannot be null");
//        }
//
//        if (JobMode.STREAMING.equals(dto.getJobType())) {
//            return buildStreamingConfig(dto);
//        }
//
//        if (SyncModeEnum.WHOLE_SYNC.equals(dto.getSyncMode())) {
//            return buildWholeSyncConfig(dto);
//        }
//
//        return buildBatchDagConfig(dto);
//    }
//
//    public String buildBatchDagConfig(BaseJobDefinitionCommand dto) {
//        return buildConfig(dto.getJobDefinitionInfo(), dto);
//    }
//
//    public String buildWholeSyncConfig(BaseJobDefinitionCommand dto) {
//        String dagJson = WholeSyncDagAssembler.assemble(
//                dto.getJobDefinitionInfo(),
//                dto.getJobType().name()
//        );
//        return buildConfig(dagJson, dto);
//    }
//
//    public String buildStreamingConfig(BaseJobDefinitionCommand dto) {
//        String dagJson = StreamDagAssembler.assemble(
//                dto.getJobDefinitionInfo(),
//                dto.getJobType().name()
//        );
//        return buildConfig(dagJson, dto);
//    }
//
//    private String buildConfig(String dagJson, BaseJobDefinitionCommand dto) {
//        DagGraph dagGraph = DagUtil.parseAndCheck(dagJson);
//        return configBuilder.build(dagGraph, dto);
//    }
//}