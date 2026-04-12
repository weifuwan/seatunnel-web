package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.exceptions.ServiceException;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.api.service.JobInstanceService;
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
import org.apache.seatunnel.web.api.service.support.JobInstanceFactory;
import org.apache.seatunnel.web.api.service.support.JobInstanceStatusReconcileService;
import org.apache.seatunnel.web.api.utils.HoconSensitiveMaskUtil;
import org.apache.seatunnel.web.common.enums.JobMode;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.core.hocon.JobConfigBuild;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.dao.repository.JobInstanceDao;
import org.apache.seatunnel.web.dao.repository.JobMetricsDao;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class JobInstanceServiceImpl implements JobInstanceService {

    @Resource
    private BatchJobDefinitionService batchDefinitionApplicationService;

    @Resource
    private StreamingJobDefinitionService streamingDefinitionApplicationService;

    @Resource
    private JobInstanceDao jobInstanceDao;

    @Resource
    private JobMetricsDao jobMetricsDao;

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
        validateDefinitionId(jobDefineId);
        validateRunMode(runMode);

        try {
            log.info("Creating job instance, jobDefineId={}, runMode={}", jobDefineId, runMode);

            BaseJobDefinitionCommand definitionDTO = loadDefinition(jobDefineId);
            JobInstance instance = buildJobInstance(definitionDTO, runMode);

            jobInstanceDao.insert(instance);

            log.info("Job instance created successfully, instanceId={}", instance.getId());
            return ConvertUtil.sourceToTarget(instance, JobInstanceVO.class);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Create job instance failed, jobDefineId={}, runMode={}", jobDefineId, runMode, e);
            throw new ServiceException(Status.CREATE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public PaginationResult<JobInstanceVO> paging(SeaTunnelJobInstanceDTO dto) {
        validatePagingRequest(dto);

        try {
            var pageResult = jobInstanceDao.pageWithDefinition(dto);

            if (pageResult.getRecords() != null) {
                pageResult.getRecords().forEach(this::maskSensitiveFields);
            }

            return PaginationResult.buildSuc(pageResult.getRecords(), pageResult);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query batch job instance paging failed, dto={}", dto, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public String buildJobConfig(BaseJobDefinitionCommand dto) {
        validateDefinitionCommand(dto);

        try {
            return jobConfigBuild.buildJobConfig(dto);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build job config failed, dto={}", dto, e);
            throw new ServiceException(Status.BUILD_JOB_INSTANCE_CONFIG_ERROR);
        }
    }

    @Override
    public String buildHoconConfig(BaseJobDefinitionCommand dto) {
        validateDefinitionCommand(dto);

        try {
            return jobConfigBuild.buildBatchDagConfig(dto);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build hocon config failed, dto={}", dto, e);
            throw new ServiceException(Status.BUILD_JOB_INSTANCE_CONFIG_ERROR);
        }
    }

    @Override
    public JobInstanceVO selectById(Long id) {
        validateInstanceId(id);

        try {
            JobInstance entity = getJobInstanceOrThrow(id);
            JobInstanceVO vo = ConvertUtil.sourceToTarget(entity, JobInstanceVO.class);
            maskSensitiveFields(vo);
            return vo;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query batch job instance by id failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public String getLogContent(Long instanceId) {
        validateInstanceId(instanceId);

        try {
            JobInstanceVO instance = selectById(instanceId);
            String logPath = instance.getLogPath();

            if (StringUtils.isBlank(logPath)) {
                throw new ServiceException(Status.BATCH_JOB_INSTANCE_LOG_NOT_EXIST);
            }

            Path path = Paths.get(logPath);
            if (!Files.exists(path)) {
                throw new ServiceException(Status.BATCH_JOB_INSTANCE_LOG_NOT_EXIST);
            }

            byte[] bytes = Files.readAllBytes(path);
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (ServiceException e) {
            throw e;
        } catch (IOException e) {
            log.error("Read job instance log failed, instanceId={}", instanceId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_LOG_ERROR);
        } catch (Exception e) {
            log.error("Query job instance log failed, instanceId={}", instanceId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_LOG_ERROR);
        }
    }

    @Override
    public boolean existsRunningInstance(Long definitionId) {
        if (definitionId == null) {
            return false;
        }

        try {
            return jobInstanceDao.existsRunningInstance(definitionId);
        } catch (Exception e) {
            log.error("Check running job instance failed, definitionId={}", definitionId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeAllByDefinitionId(Long definitionId) {
        if (definitionId == null) {
            return;
        }

        try {
            jobMetricsDao.deleteByDefinitionId(definitionId);
            jobInstanceDao.deleteByDefinitionId(definitionId);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Remove all job instances by definition id failed, definitionId={}", definitionId, e);
            throw new ServiceException(Status.DELETE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public void reconcileUnfinishedInstanceStatuses() {
        try {
            jobInstanceStatusReconcileService.reconcileUnfinishedInstanceStatuses();
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Reconcile unfinished instance statuses failed", e);
            throw new ServiceException(Status.UPDATE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    @Override
    public void updateById(JobInstance po) {
        if (po == null || po.getId() == null || po.getId() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobInstance");
        }

        try {
            jobInstanceDao.updateById(po);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Update job instance failed, id={}", po.getId(), e);
            throw new ServiceException(Status.UPDATE_BATCH_JOB_INSTANCE_ERROR);
        }
    }

    private BaseJobDefinitionCommand loadDefinition(Long jobDefineId) {
        BatchJobDefinitionVO batchVo = tryLoadBatchDefinition(jobDefineId);
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
        } catch (ServiceException e) {
            throw new ServiceException(Status.JOB_DEFINITION_NOT_EXIST);
        } catch (Exception e) {
            log.error("Load streaming job definition failed, jobDefineId={}", jobDefineId, e);
            throw new ServiceException(Status.JOB_DEFINITION_NOT_EXIST);
        }
    }

    private BatchJobDefinitionVO tryLoadBatchDefinition(Long jobDefineId) {
        try {
            return batchDefinitionApplicationService.selectById(jobDefineId);
        } catch (Exception e) {
            log.debug("Load batch job definition failed, jobDefineId={}", jobDefineId, e);
            return null;
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
            log.error("Generate job instance id failed", e);
            throw new ServiceException(Status.GENERATE_JOB_INSTANCE_ID_ERROR);
        }
    }

    private String buildLogPath(Long id) {
        return System.getProperty("user.dir")
                + File.separator
                + Paths.get(baseLogDir, "job-" + id + ".log");
    }

    private JobInstance getJobInstanceOrThrow(Long id) {
        JobInstance entity = jobInstanceDao.queryById(id);
        if (entity == null) {
            throw new ServiceException(Status.BATCH_JOB_INSTANCE_NOT_EXIST);
        }
        return entity;
    }

    private void validateDefinitionId(Long jobDefineId) {
        if (jobDefineId == null || jobDefineId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefineId");
        }
    }

    private void validateInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "instanceId");
        }
    }

    private void validateRunMode(RunMode runMode) {
        if (runMode == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "runMode");
        }
    }

    private void validatePagingRequest(SeaTunnelJobInstanceDTO dto) {
        if (dto == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "dto");
        }
        if (dto.getPageNo() == null || dto.getPageNo() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "pageNo");
        }
        if (dto.getPageSize() == null || dto.getPageSize() <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "pageSize");
        }
    }

    private void validateDefinitionCommand(BaseJobDefinitionCommand dto) {
        if (dto == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinition");
        }
    }

    private void maskSensitiveFields(JobInstanceVO vo) {
        if (vo == null) {
            return;
        }

        if (vo.getRuntimeConfig() != null) {
            vo.setRuntimeConfig(HoconSensitiveMaskUtil.maskSensitiveInfo(vo.getRuntimeConfig()));
        }
    }
}