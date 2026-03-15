package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.service.application.SeatunnelBatchJobDefinitionApplicationService;
import org.apache.seatunnel.web.api.service.application.streaming.SeatunnelStreamingJobDefinitionApplicationService;
import org.apache.seatunnel.web.api.service.support.JobConfigBuildService;
import org.apache.seatunnel.web.api.service.support.JobInstanceFactory;
import org.apache.seatunnel.web.api.service.support.JobInstanceStatusReconcileService;
import org.apache.seatunnel.web.api.thirdparty.client.SeatunnelRestClient;
import org.apache.seatunnel.web.api.utils.HoconSensitiveMaskUtil;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.common.bean.entity.PaginationResult;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.Map;

@Service
@Slf4j
public class SeaTunnelJobInstanceServiceImpl

        implements SeaTunnelJobInstanceService {

    @Lazy
    @Resource
    private SeatunnelBatchJobDefinitionApplicationService batchDefinitionApplicationService;

    @Resource
    private SeatunnelStreamingJobDefinitionApplicationService streamingDefinitionApplicationService;

    @Resource
    private SeatunnelJobMetricsMapper metricsMapper;

    @Resource
    private SeatunnelRestClient seatunnelRestClient;

    @Resource
    private JobConfigBuildService jobConfigBuildService;

    @Resource
    private JobInstanceFactory jobInstanceFactory;

    @Resource
    private JobInstanceStatusReconcileService jobInstanceStatusReconcileService;

    @Value("${seatunnel.job.log-dir:logs}")
    private String baseLogDir;

    @PostConstruct
    public void init() {
        log.info("SeaTunnelJobInstanceServiceImpl initialized: {}", System.identityHashCode(this));
    }

    @Override
    public SeatunnelJobInstanceVO create(Long jobDefineId, RunMode runMode) {
        log.info("Creating job instance, jobDefineId={}, runMode={}", jobDefineId, runMode);

        BaseJobDefinitionCommand definitionDTO = loadDefinition(jobDefineId);
        SeatunnelJobInstancePO instance = buildJobInstance(definitionDTO, runMode);

        boolean saved = save(instance);
        if (!saved) {
            throw new IllegalStateException("Failed to save job instance");
        }

        log.info("Job instance created successfully, instanceId={}", instance.getId());
        return ConvertUtil.sourceToTarget(instance, SeatunnelJobInstanceVO.class);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SeatunnelJobInstanceVO createAndSubmit(Long jobDefineId, RunMode runMode) {
        BaseJobDefinitionCommand definitionDTO = loadDefinition(jobDefineId);
        SeatunnelJobInstancePO instance = buildJobInstance(definitionDTO, runMode);

        boolean saved = save(instance);
        if (!saved) {
            throw new IllegalStateException("Failed to save job instance");
        }

        try {
            Date submitTime = new Date();

            Map<?, ?> result = seatunnelRestClient.submitJobUploadText(
                    instance.getRuntimeConfig(),
                    "job-" + instance.getId() + ".conf"
            );

            Long engineJobId = parseEngineJobId(result);
            JobStatus submitStatus = parseJobStatus(result);
            if (submitStatus == null) {
                submitStatus = JobStatus.INITIALIZING;
            }

            SeatunnelJobInstancePO update = new SeatunnelJobInstancePO();
            update.setId(instance.getId());
            update.setEngineJobId(engineJobId);
            update.setJobStatus(submitStatus);
            update.setSubmitTime(submitTime);
            update.setLastStatusSyncTime(submitTime);
            update.setUpdateTime(new Date());

            if (JobStatus.RUNNING.equals(submitStatus)
                    || JobStatus.INITIALIZING.equals(submitStatus)
                    || JobStatus.PENDING.equals(submitStatus)
                    || JobStatus.SCHEDULED.equals(submitStatus)) {
                update.setStartTime(submitTime);
            }

            updateById(update);

            log.info("Job submitted successfully, instanceId={}, engineJobId={}, status={}",
                    instance.getId(), engineJobId, submitStatus);

            return selectById(instance.getId());
        } catch (Exception e) {
            log.error("Submit job failed, instanceId={}", instance.getId(), e);
            updateStatus(instance.getId(), JobStatus.FAILED, e.getMessage());
            throw e;
        }
    }

    @Override
    public PaginationResult<SeatunnelJobInstanceVO> paging(SeatunnelJobInstanceDTO dto) {
        long pageNo = dto.getPageNo() == null || dto.getPageNo() < 1 ? 1 : dto.getPageNo();
        long pageSize = dto.getPageSize() == null || dto.getPageSize() < 1 ? 10 : dto.getPageSize();

        Page<SeatunnelJobInstanceVO> page = new Page<>(pageNo, pageSize);
        IPage<SeatunnelJobInstanceVO> result = baseMapper.pageWithDefinition(page, dto);

        if (result.getRecords() != null) {
            result.getRecords().forEach(item -> {
                item.setRuntimeConfig(HoconSensitiveMaskUtil.maskSensitiveInfo(item.getRuntimeConfig()));
            });
        }

        return PaginationResult.buildSuc(result.getRecords(), result);
    }

    @Override
    public String buildJobConfig(BaseJobDefinitionCommand dto) {
        return jobConfigBuildService.buildJobConfig(dto);
    }

    @Override
    public String buildHoconConfig(BaseJobDefinitionCommand dto) {
        return jobConfigBuildService.buildBatchDagConfig(dto);
    }

    @Override
    public String buildHoconConfigByWholeSync(BaseJobDefinitionCommand dto) {
        return jobConfigBuildService.buildWholeSyncConfig(dto);
    }

    @Override
    public String buildStreamingHoconConfig(BaseJobDefinitionCommand dto) {
        return jobConfigBuildService.buildStreamingConfig(dto);
    }

    @Override
    public SeatunnelJobInstanceVO selectById(Long id) {
        SeatunnelJobInstancePO po = getById(id);
        if (po == null) {
            throw new RuntimeException("Job instance not found");
        }

        SeatunnelJobInstanceVO vo = ConvertUtil.sourceToTarget(po, SeatunnelJobInstanceVO.class);
        if (vo.getRuntimeConfig() != null) {
            vo.setRuntimeConfig(HoconSensitiveMaskUtil.maskSensitiveInfo(vo.getRuntimeConfig()));
        }
        return vo;
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
                .in(SeatunnelJobInstancePO::getJobStatus,
                        JobStatus.INITIALIZING,
                        JobStatus.CREATED,
                        JobStatus.PENDING,
                        JobStatus.SCHEDULED,
                        JobStatus.RUNNING,
                        JobStatus.FAILING,
                        JobStatus.DOING_SAVEPOINT,
                        JobStatus.CANCELING)
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

    @Override
    public void updateStatus(Long instanceId, JobStatus status) {
        updateStatus(instanceId, status, null);
    }

    @Override
    public void updateStatus(Long instanceId, JobStatus status, String errorMessage) {
        if (instanceId == null || status == null) {
            return;
        }

        boolean endState = status.isEndState();

        lambdaUpdate()
                .eq(SeatunnelJobInstancePO::getId, instanceId)
                .set(SeatunnelJobInstancePO::getJobStatus, status)
                .set(errorMessage != null && !errorMessage.isBlank(),
                        SeatunnelJobInstancePO::getErrorMessage,
                        truncate(errorMessage, 2000))
                .set(SeatunnelJobInstancePO::getLastStatusSyncTime, new Date())
                .set(SeatunnelJobInstancePO::getUpdateTime, new Date())
                .set(endState, SeatunnelJobInstancePO::getEndTime, new Date())
                .update();
    }

    @Override
    public void updateStatusAndEngineId(Long instanceId, JobStatus status, String engineJobId) {
        if (instanceId == null || status == null) {
            return;
        }

        boolean endState = status.isEndState();

        lambdaUpdate()
                .eq(SeatunnelJobInstancePO::getId, instanceId)
                .set(SeatunnelJobInstancePO::getJobStatus, status)
                .set(engineJobId != null && !engineJobId.isBlank(),
                        SeatunnelJobInstancePO::getEngineJobId,
                        engineJobId)
                .set(SeatunnelJobInstancePO::getLastStatusSyncTime, new Date())
                .set(SeatunnelJobInstancePO::getUpdateTime, new Date())
                .set(endState, SeatunnelJobInstancePO::getEndTime, new Date())
                .update();
    }

    @Override
    public void reconcileInstanceStatus(Long instanceId) {
        jobInstanceStatusReconcileService.reconcileInstanceStatus(instanceId);
    }

    @Override
    public void reconcileUnfinishedInstanceStatuses() {
        jobInstanceStatusReconcileService.reconcileUnfinishedInstanceStatuses();
    }

    private BaseJobDefinitionCommand loadDefinition(Long jobDefineId) {
        SeatunnelBatchJobDefinitionVO batchVo = null;
        try {
            batchVo = batchDefinitionApplicationService.selectById(jobDefineId);
        } catch (Exception ignored) {
        }

        if (batchVo != null && batchVo.getJobType() != null) {
            if (JobMode.BATCH == batchVo.getJobType()) {
                return ConvertUtil.sourceToTarget(batchVo, SeatunnelBatchJobDefinitionDTO.class);
            }
            if (JobMode.STREAMING == batchVo.getJobType()) {
                return ConvertUtil.sourceToTarget(batchVo, SeatunnelStreamingJobDefinitionDTO.class);
            }
        }

        try {
            return ConvertUtil.sourceToTarget(
                    streamingDefinitionApplicationService.selectById(jobDefineId),
                    SeatunnelStreamingJobDefinitionDTO.class
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Job definition not found: " + jobDefineId, e);
        }
    }

    private SeatunnelJobInstancePO buildJobInstance(BaseJobDefinitionCommand definitionDTO,
                                                    RunMode runMode) {
        Long id = generateInstanceId();
        String runtimeConfig = buildJobConfig(definitionDTO);

        return jobInstanceFactory.create(
                definitionDTO,
                id,
                runtimeConfig,
                runMode,
                buildLogPath(id)
        );
    }

    private Long generateInstanceId() {
        try {
            return CodeGenerateUtils.getInstance().genCode();
        } catch (CodeGenerateUtils.CodeGenerateException e) {
            throw new RuntimeException("Failed to generate job instance ID", e);
        }
    }

    private String buildLogPath(Long id) {
        return System.getProperty("user.dir")
                + File.separator
                + Paths.get(baseLogDir, "job-" + id + ".log");
    }

    private Long parseEngineJobId(Map<?, ?> result) {
        if (result == null || result.isEmpty()) {
            return null;
        }

        Object value = firstNonNull(
                result.get("jobId"),
                result.get("job_id"),
                result.get("id"),
                result.get("jobEngineId")
        );

        return value == null ? null : Long.parseLong(value.toString());
    }

    private JobStatus parseJobStatus(Map<?, ?> result) {
        if (result == null || result.isEmpty()) {
            return null;
        }

        Object value = firstNonNull(
                result.get("jobStatus"),
                result.get("status"),
                result.get("state")
        );

        if (value == null) {
            return null;
        }

        try {
            return JobStatus.fromString(String.valueOf(value));
        } catch (Exception e) {
            log.warn("Unknown job status value: {}", value);
            return null;
        }
    }

    private Object firstNonNull(Object... values) {
        if (values == null) {
            return null;
        }
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String truncate(String text, int maxLength) {
        if (text == null) {
            return null;
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }
}