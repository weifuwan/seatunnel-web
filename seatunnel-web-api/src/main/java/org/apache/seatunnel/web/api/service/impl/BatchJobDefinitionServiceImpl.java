package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.exceptions.ServiceException;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.service.application.SeatunnelJobScheduleApplicationService;
import org.apache.seatunnel.web.common.enums.ScheduleStatusEnum;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.core.definition.assembler.BatchJobDefinitionAssembler;
import org.apache.seatunnel.web.core.definition.handler.JobDefinitionHandler;
import org.apache.seatunnel.web.core.definition.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.core.definition.registry.JobDefinitionHandlerRegistry;
import org.apache.seatunnel.web.dao.entity.BatchJobDefinition;
import org.apache.seatunnel.web.dao.entity.JobSchedule;
import org.apache.seatunnel.web.dao.repository.BatchJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class BatchJobDefinitionServiceImpl extends BaseServiceImpl implements BatchJobDefinitionService {

    @Resource
    private BatchJobDefinitionDao batchJobDefinitionDao;

    @Resource
    private JobDefinitionHandlerRegistry handlerRegistry;

    @Resource
    private BatchJobDefinitionAssembler assembler;

    @Resource
    private SeatunnelJobScheduleApplicationService scheduleApplicationService;

    @Lazy
    @Resource
    private SeaTunnelJobInstanceService seatunnelJobInstanceService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveOrUpdate(SeatunnelBatchJobDefinitionDTO dto) {
        validateSaveRequest(dto);

        try {
            Date now = new Date();
            BatchJobDefinition existing = dto.getId() == null ? null : batchJobDefinitionDao.queryById(dto.getId());

            JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
            JobDefinitionAnalysisResult analysis = handler.analyze(dto);

            BatchJobDefinition entity;
            if (existing == null) {
                entity = assembler.create(dto, analysis, now);
            } else {
                entity = existing;
                assembler.update(entity, dto, analysis, now);
            }

            batchJobDefinitionDao.saveOrUpdate(entity);
            scheduleApplicationService.saveOrUpdateSchedule(entity.getId(), dto);

            return entity.getId();
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Save or update batch job definition failed, dto={}", dto, e);
            throw new ServiceException(Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public BatchJobDefinitionVO selectById(Long id) {
        validateId(id);

        try {
            BatchJobDefinition entity = getDefinitionOrThrow(id);
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
                    batchJobDefinitionDao.selectPageWithLatestInstance(dto, offset, dto.getPageSize());

            Long total = batchJobDefinitionDao.count(dto);

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
    public Boolean delete(Long id) {
        validateId(id);

        BatchJobDefinition definition = getDefinitionOrThrow(id);
        validateDelete(definition.getId());

        try {
            scheduleApplicationService.removeSchedule(id);
            seatunnelJobInstanceService.removeAllByDefinitionId(id);
            return batchJobDefinitionDao.deleteById(id);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Delete batch job definition failed, id={}", id, e);
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public String buildHoconConfig(SeatunnelBatchJobDefinitionDTO dto) {
        validateBuildRequest(dto);

        try {
            JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
            return handler.buildHoconConfig(dto);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build batch job hocon config failed, dto={}", dto, e);
            throw new ServiceException(Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR);
        }
    }

    private void validateSaveRequest(SeatunnelBatchJobDefinitionDTO dto) {
        if (dto == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "dto");
        }
        if (StringUtils.isBlank(dto.getJobDefinitionInfo())) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinitionInfo");
        }
    }

    private void validateBuildRequest(SeatunnelBatchJobDefinitionDTO dto) {
        if (dto == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "dto");
        }
        if (StringUtils.isBlank(dto.getJobDefinitionInfo())) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinitionInfo");
        }
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

    private BatchJobDefinition getDefinitionOrThrow(Long id) {
        BatchJobDefinition entity = batchJobDefinitionDao.queryById(id);
        if (entity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }
        return entity;
    }

    private void validateDelete(Long id) {
        if (seatunnelJobInstanceService.existsRunningInstance(id)) {
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR, "running instance exists");
        }

        JobSchedule schedule = scheduleApplicationService.getByTaskDefinitionId(id);
        if (schedule != null && ScheduleStatusEnum.ACTIVE.equals(schedule.getScheduleStatus())) {
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