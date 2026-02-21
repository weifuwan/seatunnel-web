package org.apache.seatunnel.admin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.builder.HoconConfigBuilder;
import org.apache.seatunnel.admin.dag.DagGraph;
import org.apache.seatunnel.admin.dag.StreamDagAssembler;
import org.apache.seatunnel.admin.dag.WholeSyncDagAssembler;
import org.apache.seatunnel.admin.dao.SeatunnelJobInstanceMapper;
import org.apache.seatunnel.admin.dao.SeatunnelJobMetricsMapper;
import org.apache.seatunnel.admin.service.SeatunnelBatchJobDefinitionService;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.utils.DagUtil;
import org.apache.seatunnel.communal.bean.dto.BaseSeatunnelJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.communal.enums.RunMode;
import org.apache.seatunnel.communal.utils.CodeGenerateUtils;
import org.apache.seatunnel.communal.utils.ConvertUtil;
import org.apache.seatunnel.engine.common.job.JobStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

@Service
@Slf4j
public class SeatunnelJobInstanceServiceImpl
        extends ServiceImpl<SeatunnelJobInstanceMapper, SeatunnelJobInstancePO>
        implements SeatunnelJobInstanceService {

    @Resource
    private SeatunnelBatchJobDefinitionService definitionService;

    @Resource
    private SeatunnelJobMetricsMapper metricsMapper;

    @Resource
    private HoconConfigBuilder configBuilder;

    @Value("${seatunnel.job.log-dir:logs}")
    private String baseLogDir;


    @Override
    public SeatunnelJobInstanceVO create(Long jobDefineId, RunMode runMode) {

        log.info("Creating job instance, jobDefineId={}, runMode={}",
                jobDefineId, runMode);

        SeatunnelBatchJobDefinitionVO definitionVO =
                definitionService.selectById(jobDefineId);

        if (definitionVO == null) {
            throw new IllegalArgumentException(
                    "Job definition not found: " + jobDefineId);
        }

        SeatunnelJobInstancePO instance =
                buildJobInstance(definitionVO, runMode);

        boolean saved = save(instance);
        if (!saved) {
            throw new IllegalStateException("Failed to save job instance");
        }

        log.info("Job instance created successfully, instanceId={}",
                instance.getId());

        return ConvertUtil.sourceToTarget(
                instance,
                SeatunnelJobInstanceVO.class
        );
    }

    @Override
    public PaginationResult<SeatunnelJobInstanceVO> paging(
            SeatunnelJobInstanceDTO dto) {

        Page<SeatunnelJobInstanceVO> page =
                new Page<>(dto.getPageNo(), dto.getPageSize());

        IPage<SeatunnelJobInstanceVO> result =
                baseMapper.pageWithDefinition(page, dto);

        return PaginationResult.buildSuc(
                result.getRecords(),
                result
        );
    }


    private SeatunnelJobInstancePO buildJobInstance(
            SeatunnelBatchJobDefinitionVO definitionVO,
            RunMode runMode) {

        Long id = generateInstanceId();

        String jobConfig = buildHoconConfig(
                ConvertUtil.sourceToTarget(
                        definitionVO,
                        SeatunnelBatchJobDefinitionDTO.class
                ));

        return SeatunnelJobInstancePO.builder()
                .id(id)
                .jobDefinitionId(definitionVO.getId())
                .startTime(new Date())
                .jobConfig(jobConfig)
                .logPath(buildLogPath(id))
                .runMode(runMode)
                .build();
    }

    private Long generateInstanceId() {
        try {
            return CodeGenerateUtils.getInstance().genCode();
        } catch (CodeGenerateUtils.CodeGenerateException e) {
            throw new RuntimeException(
                    "Failed to generate job instance ID", e);
        }
    }

    private String buildLogPath(Long id) {
        return System.getProperty("user.dir") + File.separator + Paths.get(baseLogDir,
                "job-" + id + ".log").toString();
    }


    @Override
    public String buildHoconConfig(
            BaseSeatunnelJobDefinitionDTO dto) {

        return buildConfig(
                dto.getJobDefinitionInfo(),
                dto
        );
    }

    @Override
    public String buildHoconConfigByWholeSync(
            BaseSeatunnelJobDefinitionDTO dto) {

        String dagJson =
                WholeSyncDagAssembler.assemble(
                        dto.getJobDefinitionInfo(),
                        dto.getJobType());

        return buildConfig(dagJson, dto);
    }

    @Override
    public String buildHoconConfigWithStream(
            BaseSeatunnelJobDefinitionDTO dto) {

        String dagJson =
                StreamDagAssembler.assemble(
                        dto.getJobDefinitionInfo(),
                        dto.getJobType());

        return buildConfig(dagJson, dto);
    }

    @Override
    public SeatunnelJobInstanceVO selectById(Long id) {

        SeatunnelJobInstancePO po = getById(id);

        if (po == null) {
            throw new RuntimeException("Job instance not found");
        }

        return ConvertUtil.sourceToTarget(
                po,
                SeatunnelJobInstanceVO.class
        );
    }

    @Override
    public String getLogContent(Long instanceId) {
        SeatunnelJobInstanceVO instance = selectById(instanceId);

        String logPath = instance.getLogPath();

        if (logPath == null || logPath.isEmpty()) {
            return "No log available";
        }

        Path path = Paths.get(logPath);

        if (!Files.exists(path)) {
            return "Log file not found";
        }

        try {
            byte[] bytes = Files.readAllBytes(path);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read log file", e);
        }
    }

    @Override
    public boolean existsRunningInstance(Long definitionId) {

        if (definitionId == null) {
            return false;
        }

        long count = lambdaQuery()
                .eq(SeatunnelJobInstancePO::getJobDefinitionId, definitionId)
                .eq(SeatunnelJobInstancePO::getJobStatus, JobStatus.RUNNING.toString())
                .count();

        return count > 0;
    }


    @Override
    public void deleteInstancesByDefinitionId(Long definitionId) {

        if (definitionId == null) {
            return;
        }

        lambdaUpdate()
                .eq(SeatunnelJobInstancePO::getJobDefinitionId, definitionId)
                .remove();
    }


    @Override
    public void deleteMetricsByDefinitionId(Long definitionId) {

        if (definitionId == null) {
            return;
        }

        metricsMapper.delete(
                new LambdaQueryWrapper<SeatunnelJobMetricsPO>()
                        .eq(SeatunnelJobMetricsPO::getJobDefinitionId, definitionId)
        );
    }

    @Override
    public void removeAllByDefinitionId(Long definitionId) {

        if (definitionId == null) {
            return;
        }

        deleteMetricsByDefinitionId(definitionId);

        lambdaUpdate()
                .eq(SeatunnelJobInstancePO::getJobDefinitionId, definitionId)
                .remove();
    }


    private String buildConfig(String dagJson,
                               BaseSeatunnelJobDefinitionDTO dto) {

        DagGraph dagGraph = DagUtil.parseAndCheck(dagJson);
        return configBuilder.build(dagGraph, dto);
    }
}
