package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
import org.apache.seatunnel.web.api.service.support.JobInstanceFactory;
import org.apache.seatunnel.web.api.service.support.JobInstanceStatusReconcileService;
import org.apache.seatunnel.web.api.utils.HoconSensitiveMaskUtil;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.core.hocon.JobConfigBuild;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.dao.repository.JobInstanceDao;
import org.apache.seatunnel.web.dao.repository.JobMetricsDao;
import org.apache.seatunnel.web.engine.client.client.SeatunnelRestClient;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.springframework.beans.factory.annotation.Value;
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
public class SeaTunnelJobInstanceServiceImpl implements SeaTunnelJobInstanceService {

    @Resource
    private BatchJobDefinitionService batchDefinitionApplicationService;

    @Resource
    private StreamingJobDefinitionService streamingDefinitionApplicationService;

    @Resource
    private JobInstanceDao jobInstanceDao;

    @Resource
    private JobMetricsDao jobMetricsDao;

    @Resource
    private SeatunnelRestClient seatunnelRestClient;

    @Resource
    private JobConfigBuild jobConfigBuild;

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
    public JobInstanceVO create(Long jobDefineId, RunMode runMode) {
        log.info("Creating job instance, jobDefineId={}, runMode={}", jobDefineId, runMode);

        BaseJobDefinitionCommand definitionDTO = loadDefinition(jobDefineId);
        JobInstance instance = buildJobInstance(definitionDTO, runMode);

        jobInstanceDao.insert(instance);

        log.info("Job instance created successfully, instanceId={}", instance.getId());
        return ConvertUtil.sourceToTarget(instance, JobInstanceVO.class);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public JobInstanceVO createAndSubmit(Long jobDefineId, RunMode runMode) {
        BaseJobDefinitionCommand definitionDTO = loadDefinition(jobDefineId);
        JobInstance instance = buildJobInstance(definitionDTO, runMode);

        jobInstanceDao.insert(instance);

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

            jobInstanceDao.updateSubmitResult(
                    instance.getId(),
                    engineJobId,
                    submitStatus,
                    submitTime
            );

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
    public PaginationResult<JobInstanceVO> paging(SeatunnelJobInstanceDTO dto) {
        var result = jobInstanceDao.pageWithDefinition(dto);

        if (result.getRecords() != null) {
            result.getRecords().forEach(item ->
                    item.setRuntimeConfig(HoconSensitiveMaskUtil.maskSensitiveInfo(item.getRuntimeConfig()))
            );
        }

        return PaginationResult.buildSuc(result.getRecords(), result);
    }

    @Override
    public String buildJobConfig(BaseJobDefinitionCommand dto) {
        return jobConfigBuild.buildJobConfig(dto);
    }

    @Override
    public String buildHoconConfig(BaseJobDefinitionCommand dto) {
        return jobConfigBuild.buildBatchDagConfig(dto);
    }

    @Override
    public String buildHoconConfigByWholeSync(BaseJobDefinitionCommand dto) {
        return jobConfigBuild.buildWholeSyncConfig(dto);
    }

    @Override
    public String buildStreamingHoconConfig(BaseJobDefinitionCommand dto) {
        return jobConfigBuild.buildStreamingConfig(dto);
    }

    @Override
    public JobInstanceVO selectById(Long id) {
        JobInstance po = jobInstanceDao.queryById(id);
        if (po == null) {
            throw new RuntimeException("Job instance not found: " + id);
        }

        JobInstanceVO vo = ConvertUtil.sourceToTarget(po, JobInstanceVO.class);
        if (vo.getRuntimeConfig() != null) {
            vo.setRuntimeConfig(HoconSensitiveMaskUtil.maskSensitiveInfo(vo.getRuntimeConfig()));
        }
        return vo;
    }

    @Override
    public String getLogContent(Long instanceId) {
        JobInstanceVO instance = selectById(instanceId);

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
        return jobInstanceDao.existsRunningInstance(definitionId);
    }

    @Override
    public void deleteInstancesByDefinitionId(Long definitionId) {
        if (definitionId == null) {
            return;
        }
        jobInstanceDao.deleteByDefinitionId(definitionId);
    }

    @Override
    public void deleteMetricsByDefinitionId(Long definitionId) {
        if (definitionId == null) {
            return;
        }
        jobMetricsDao.deleteByDefinitionId(definitionId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeAllByDefinitionId(Long definitionId) {
        if (definitionId == null) {
            return;
        }

        jobMetricsDao.deleteByDefinitionId(definitionId);
        jobInstanceDao.deleteByDefinitionId(definitionId);
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
        jobInstanceDao.updateStatus(instanceId, status, errorMessage);
    }

    @Override
    public void updateStatusAndEngineId(Long instanceId, JobStatus status, String engineJobId) {
        if (instanceId == null || status == null) {
            return;
        }
        jobInstanceDao.updateStatusAndEngineId(instanceId, status, engineJobId);
    }

    @Override
    public void reconcileInstanceStatus(Long instanceId) {
        jobInstanceStatusReconcileService.reconcileInstanceStatus(instanceId);
    }

    @Override
    public void reconcileUnfinishedInstanceStatuses() {
        jobInstanceStatusReconcileService.reconcileUnfinishedInstanceStatuses();
    }

    @Override
    public void updateById(JobInstance po) {
        jobInstanceDao.updateById(po);
    }

    private BaseJobDefinitionCommand loadDefinition(Long jobDefineId) {
        BatchJobDefinitionVO batchVo = null;
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

    private JobInstance buildJobInstance(BaseJobDefinitionCommand definitionDTO, RunMode runMode) {
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
}