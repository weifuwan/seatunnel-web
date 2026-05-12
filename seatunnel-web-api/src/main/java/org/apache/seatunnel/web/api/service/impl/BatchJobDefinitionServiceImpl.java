package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.api.service.BatchJobInstanceService;
import org.apache.seatunnel.web.api.service.JobScheduleService;
import org.apache.seatunnel.web.api.service.application.JobScheduleApplicationService;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.core.job.assembler.JobDefinitionAssembler;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.core.job.registry.JobDefinitionModeHandlerRegistry;
import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.dao.entity.JobSchedule;
import org.apache.seatunnel.web.dao.repository.JobDefinitionContentDao;
import org.apache.seatunnel.web.dao.repository.JobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.*;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchGuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchGuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.BatchJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.config.JobScheduleConfig;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class BatchJobDefinitionServiceImpl extends BaseServiceImpl implements BatchJobDefinitionService {

    @Resource
    private JobDefinitionModeHandlerRegistry handlerRegistry;

    @Resource
    private JobDefinitionDao jobDefinitionDao;

    @Resource
    private JobDefinitionContentDao jobDefinitionContentDao;

    @Resource
    private JobDefinitionAssembler jobDefinitionAssembler;

    @Resource
    private JobScheduleApplicationService scheduleApplicationService;

    @Resource
    private BatchJobInstanceService jobInstanceService;

    @Resource
    private BatchJobDefinitionQueryService definitionQueryService;

    @Resource
    private JobScheduleService jobScheduleService;

    /**
     * Save or update batch job definition.
     */
    @Transactional(rollbackFor = Exception.class)
    protected Long doSaveOrUpdate(BatchJobSaveCommand command) {
        validateBase(command);

        try {
            Date now = new Date();

            JobDefinitionModeHandler handler = getAndValidateHandler(command);
            JobDefinitionAnalysisResult analysis = handler.analyze(command);
            String definitionContent = handler.serializeDefinition(command);

            JobDefinitionEntity existing = command.getId() == null
                    ? null
                    : jobDefinitionDao.queryById(command.getId());

            JobDefinitionEntity entity;
            int nextVersion;

            if (ObjectUtils.isEmpty(existing)) {
                entity = jobDefinitionAssembler.create(command, analysis);
                nextVersion = 1;
            } else {
                nextVersion = existing.getJobVersion() == null ? 1 : existing.getJobVersion() + 1;
                entity = existing;
                jobDefinitionAssembler.update(entity, command, analysis, now, nextVersion);
            }

            jobDefinitionDao.saveOrUpdate(entity);

            JobDefinitionContentEntity contentEntity = JobDefinitionContentEntity.builder()
                    .jobDefinitionId(entity.getId())
                    .version(nextVersion)
                    .mode(command.getMode())
                    .contentSchemaVersion(1)
                    .envConfig(JSONUtils.toJsonString(command.getEnv()))
                    .definitionContent(definitionContent)
                    .createTime(now)
                    .build();

            jobDefinitionContentDao.save(contentEntity);

            scheduleApplicationService.saveOrUpdateSchedule(entity.getId(), command);

            return entity.getId();
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Save or update job definition failed, command={}", command, e);
            throw new ServiceException(Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public Long saveOrUpdate(BatchScriptJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public Long saveOrUpdate(BatchGuideSingleJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public Long saveOrUpdate(BatchGuideMultiJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    /**
     * Build hocon config.
     */
    protected String doBuildHoconConfig(JobDefinitionSaveCommand command) {
        validateBase(command);

        try {
            return buildHoconConfigInternal(command);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build hocon config failed, command={}", command, e);
            throw new ServiceException(Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR);
        }
    }

    @Override
    public String buildHoconConfig(BatchScriptJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(BatchGuideSingleJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(BatchGuideMultiJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public BatchJobDefinitionVO selectById(Long id) {
        return definitionQueryService.selectById(id);
    }

    @Override
    public PaginationResult<BatchJobDefinitionVO> paging(BatchJobDefinitionQueryDTO dto) {
        validatePagingRequest(dto);

        try {
            int offset = (dto.getPageNo() - 1) * dto.getPageSize();

            List<BatchJobDefinitionVO> records =
                    jobDefinitionDao.selectPageWithLatestInstance(dto, offset, dto.getPageSize());

            Long total = jobDefinitionDao.count(dto);

            if (records != null) {
                records.forEach(vo -> fillScheduleFields(vo.getId(), vo));
            }

            return PaginationResult.buildSuc(records, dto.getPageNo(), dto.getPageSize(), total);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query batch job definition paging failed, dto={}", dto, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean delete(Long jobDefinitionId) {
        validateId(jobDefinitionId);

        JobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(jobDefinitionId);
        validateDelete(definition.getId());

        try {
            scheduleApplicationService.removeSchedule(jobDefinitionId);
            jobInstanceService.removeAllByDefinitionId(jobDefinitionId);
            jobDefinitionContentDao.deleteByJobDefinitionId(jobDefinitionId);
            return jobDefinitionDao.deleteById(jobDefinitionId);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Delete batch job definition failed, id={}", jobDefinitionId, e);
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public JobDefinitionSaveCommand selectEditDetail(Long id) {
        validateId(id);

        try {
            JobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(id);

            validateEditable(definition);

            JobDefinitionContentEntity latestContent =
                    jobDefinitionContentDao.queryLatestByJobDefinitionId(id);

            if (latestContent == null) {
                throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST, "definition content not found");
            }

            JobDefinitionModeHandler handler = handlerRegistry.getHandler(definition.getMode());

            return handler.buildEditCommand(
                    definition,
                    latestContent,
                    buildScheduleConfig(id)
            );
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query job definition edit detail failed, id={}", id, e);
            throw new ServiceException(e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateReleaseState(Long id, ReleaseState releaseState) {
        if (id == null) {
            throw new RuntimeException("Job definition id cannot be null");
        }
        if (releaseState == null) {
            throw new RuntimeException("Release state cannot be null");
        }

        JobDefinitionEntity entity = jobDefinitionDao.queryById(id);
        if (entity == null) {
            throw new RuntimeException("Job definition does not exist");
        }

        ReleaseState currentState = entity.getReleaseState();

        // 状态已经一致时，也顺手同步一下调度状态，避免 Quartz 状态和业务状态不一致
        if (releaseState == currentState) {
            syncScheduleState(id, releaseState);
            log.info("Job definition release state already synced, id={}, state={}", id, releaseState);
            return true;
        }

        // 下线：先停调度，再更新任务定义状态
        if (releaseState.isOffline()) {
            syncScheduleState(id, ReleaseState.OFFLINE);
            updateJobReleaseState(id, ReleaseState.OFFLINE);

            log.info("Job definition offline completed, id={}", id);
            return true;
        }

        // 上线：先更新任务定义状态，再启动调度
        if (releaseState.isOnline()) {
            updateJobReleaseState(id, ReleaseState.ONLINE);
            syncScheduleState(id, ReleaseState.ONLINE);

            log.info("Job definition online completed, id={}", id);
            return true;
        }

        throw new RuntimeException("Unsupported release state: " + releaseState);
    }

    /**
     * Validate whether job definition can be edited.
     */
    private void validateEditable(JobDefinitionEntity definition) {
        if (definition == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }

        if (definition.getReleaseState() == null) {
            throw new RuntimeException(
                    "job release state is empty"
            );
        }

        if (!definition.getReleaseState().isOffline()) {
            throw new RuntimeException("only offline job definition can be edited");
        }
    }

    private void updateJobReleaseState(Long jobDefinitionId, ReleaseState releaseState) {
        boolean updated = jobDefinitionDao.updateReleaseState(jobDefinitionId, releaseState);

        if (!updated) {
            throw new RuntimeException("Failed to update job definition release state");
        }
    }

    private void syncScheduleState(Long jobDefinitionId, ReleaseState releaseState) {
        JobSchedule schedule = jobScheduleService.getByTaskDefinitionId(jobDefinitionId);
        if (schedule == null) {
            log.info("No schedule found for job definition, skip schedule sync. jobDefinitionId={}", jobDefinitionId);
            return;
        }

        if (releaseState.isOnline()) {
            jobScheduleService.startSchedule(schedule.getId());
            log.info(
                    "Schedule started with job definition online, jobDefinitionId={}, scheduleId={}",
                    jobDefinitionId,
                    schedule.getId()
            );
            return;
        }

        if (releaseState.isOffline()) {
            jobScheduleService.stopSchedule(schedule.getId());
            log.info(
                    "Schedule stopped with job definition offline, jobDefinitionId={}, scheduleId={}",
                    jobDefinitionId,
                    schedule.getId()
            );
        }
    }

    /**
     * Build hocon config internally.
     */
    private String buildHoconConfigInternal(JobDefinitionSaveCommand command) {
        JobDefinitionModeHandler handler = getAndValidateHandler(command);
        String hocon = handler.buildHoconConfig(command);

        if (StringUtils.isBlank(hocon)) {
            throw new ServiceException(Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR, "hocon config is empty");
        }
        return hocon;
    }

    /**
     * Get handler and validate command.
     */
    private JobDefinitionModeHandler getAndValidateHandler(JobDefinitionSaveCommand command) {
        validateBase(command);
        JobDefinitionModeHandler handler = handlerRegistry.getHandler(command.getMode());
        handler.validate(command);
        return handler;
    }


    /**
     * Build schedule config.
     */
    private JobScheduleConfig buildScheduleConfig(Long definitionId) {
        JobSchedule schedule = scheduleApplicationService.getByTaskDefinitionId(definitionId);
        if (schedule == null) {
            return null;
        }

        JobScheduleConfig config = null;
        if (StringUtils.isNotBlank(schedule.getScheduleConfig())) {
            try {
                config = JSONUtils.parseObject(schedule.getScheduleConfig(), JobScheduleConfig.class);
            } catch (Exception e) {
                log.warn("Parse schedule config failed, definitionId={}, raw={}",
                        definitionId, schedule.getScheduleConfig(), e);
            }
        }

        if (config == null) {
            config = new JobScheduleConfig();
        }

        if (StringUtils.isBlank(config.getCronExpression())) {
            config.setCronExpression(schedule.getCronExpression());
        }
        if (StringUtils.isBlank(config.getScheduleRunType()) && schedule.getScheduleStatus() != null) {
            config.setScheduleRunType(schedule.getScheduleStatus().getDesc());
        }

        return config;
    }

    /**
     * Fill schedule fields for page result.
     */
    private void fillScheduleFields(Long definitionId, BatchJobDefinitionVO vo) {
        if (definitionId == null || vo == null) {
            return;
        }

        try {
            JobSchedule schedule = scheduleApplicationService.getByTaskDefinitionId(definitionId);
            if (schedule == null) {
                return;
            }

            vo.setCronExpression(schedule.getCronExpression());
            if (schedule.getScheduleStatus() != null) {
                vo.setScheduleStatus(schedule.getScheduleStatus());
            }
            if (StringUtils.isNotBlank(schedule.getScheduleConfig())) {
                vo.setScheduleConfig(schedule.getScheduleConfig());
            }
        } catch (Exception e) {
            log.warn("Fill schedule fields failed, definitionId={}", definitionId, e);
        }
    }

    /**
     * Validate save request base fields.
     */
    private void validateBase(JobDefinitionSaveCommand command) {
        if (command == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "command");
        }
        if (command.getBasic() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "basic");
        }
        if (command.getMode() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "mode");
        }
        if (command.getId() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
        if (StringUtils.isBlank(command.getBasic().getJobName())) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobName");
        }
    }

    /**
     * Validate paging request.
     */
    private void validatePagingRequest(BatchJobDefinitionQueryDTO dto) {
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

    /**
     * Validate id.
     */
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
    }

    /**
     * Validate delete condition.
     */
    private void validateDelete(Long id) {
        if (jobInstanceService.existsRunningInstance(id)) {
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR, "running instance exists");
        }

        JobSchedule schedule = scheduleApplicationService.getByTaskDefinitionId(id);
        if (schedule != null
                && schedule.getScheduleStatus() != null
                && schedule.getScheduleStatus().shouldStartQuartz()) {
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR, "schedule is still active");
        }
    }
}