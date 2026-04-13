package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.exceptions.ServiceException;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.api.service.JobInstanceService;
import org.apache.seatunnel.web.api.service.application.JobScheduleApplicationService;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.common.utils.JSONUtils;
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
    private JobInstanceService jobInstanceService;

    @Transactional(rollbackFor = Exception.class)
    protected Long doSaveOrUpdate(JobDefinitionSaveCommand command) {
        validateBase(command);

        try {
            Date now = new Date();

            JobDefinitionModeHandler handler = handlerRegistry.getHandler(command.getMode());
            handler.validate(command);

            JobDefinitionAnalysisResult analysis = handler.analyze(command);
            String definitionContent = handler.serializeDefinition(command);
            String hoconContent = handler.buildHoconConfig(command);

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
    public Long saveOrUpdate(ScriptJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public Long saveOrUpdate(GuideSingleJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public Long saveOrUpdate(GuideMultiJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    protected String doBuildHoconConfig(JobDefinitionSaveCommand command) {
        validateBase(command);

        try {
            JobDefinitionModeHandler handler = handlerRegistry.getHandler(command.getMode());
            handler.validate(command);
            return handler.buildHoconConfig(command);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build hocon config failed, command={}", command, e);
            throw new ServiceException(Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR);
        }
    }

    @Override
    public String buildHoconConfig(ScriptJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(GuideSingleJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(GuideMultiJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

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
        if (StringUtils.isBlank(command.getBasic().getJobName())) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobName");
        }
    }

    @Override
    public BatchJobDefinitionVO selectById(Long id) {
        validateId(id);

        try {
            JobDefinitionEntity entity = getDefinitionOrThrow(id);
            BatchJobDefinitionVO vo = ConvertUtil.sourceToTarget(entity, BatchJobDefinitionVO.class);
            fillScheduleFields(id, vo);
            return vo;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query batch job definition by id failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
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

        JobDefinitionEntity definition = getDefinitionOrThrow(jobDefinitionId);
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
    public JobDefinitionEditDTO selectEditDetail(Long id) {
        validateId(id);

        try {
            JobDefinitionEntity definition = getDefinitionOrThrow(id);
            JobDefinitionContentEntity latestContent =
                    jobDefinitionContentDao.queryLatestByJobDefinitionId(id);

            if (latestContent == null) {
                throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST, "definition content not found");
            }

            JobDefinitionEditDTO dto = new JobDefinitionEditDTO();
            dto.setId(definition.getId());
            dto.setMode(definition.getMode());
            dto.setBasic(buildBasicConfig(definition));
            dto.setSchedule(buildScheduleConfig(id));

            JobDefinitionModeHandler handler = handlerRegistry.getHandler(definition.getMode());
            handler.fillEditDTO(latestContent.getDefinitionContent(), dto);

            return dto;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query job definition edit detail failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    private JobBasicConfig buildBasicConfig(JobDefinitionEntity definition) {
        JobBasicConfig basic = new JobBasicConfig();
        basic.setId(definition.getId());
        basic.setMode(definition.getMode());
        basic.setJobType(definition.getJobType());
        basic.setJobName(definition.getJobName());
        basic.setJobDesc(definition.getJobDesc());
        basic.setClientId(definition.getClientId());
        basic.setParallelism(definition.getParallelism());
        return basic;
    }

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
            config.setScheduleRunType(schedule.getScheduleStatus().name());
        }

        return config;
    }

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

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
    }

    private JobDefinitionEntity getDefinitionOrThrow(Long id) {
        JobDefinitionEntity entity = jobDefinitionDao.queryById(id);
        if (entity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }
        return entity;
    }

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

    private void fillScheduleFields(Long definitionId, BatchJobDefinitionVO vo) {
        if (definitionId == null || vo == null) {
            return;
        }

        try {
            JobSchedule schedule = scheduleApplicationService.getByTaskDefinitionId(definitionId);
            if (schedule != null) {
                vo.setCronExpression(schedule.getCronExpression());
                vo.setScheduleStatus(schedule.getScheduleStatus());
            }
        } catch (Exception e) {
            log.warn("Fill batch job definition schedule fields failed, definitionId={}", definitionId, e);
        }
    }
}