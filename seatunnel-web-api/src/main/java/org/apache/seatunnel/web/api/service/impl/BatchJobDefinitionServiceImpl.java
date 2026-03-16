package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
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
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

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

    @Transactional(rollbackFor = Exception.class)
    public Long saveOrUpdate(SeatunnelBatchJobDefinitionDTO dto) {
        validateSaveRequest(dto);

        Date now = new Date();
        BatchJobDefinition existing = batchJobDefinitionDao.queryById(dto.getId());

        JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
        JobDefinitionAnalysisResult analysis = handler.analyze(dto);

        BatchJobDefinition po;
        if (existing == null) {
            po = assembler.create(dto, analysis, now);
        } else {
            po = existing;
            assembler.update(po, dto, analysis, now);
        }

        batchJobDefinitionDao.saveOrUpdate(po);

        scheduleApplicationService.saveOrUpdateSchedule(po.getId(), dto);

        return po.getId();
    }

    public BatchJobDefinitionVO selectById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        BatchJobDefinition po = batchJobDefinitionDao.queryById(id);
        if (po == null) {
            throw new RuntimeException("Job definition is not exist");
        }

        BatchJobDefinitionVO vo =
                ConvertUtil.sourceToTarget(po, BatchJobDefinitionVO.class);

        JobSchedule schedule = scheduleApplicationService.getByTaskDefinitionId(id);
        if (schedule != null) {
            vo.setCronExpression(schedule.getCronExpression());
            vo.setScheduleStatus(schedule.getScheduleStatus());
        }

        return vo;
    }

    public PaginationResult<BatchJobDefinitionVO> paging(BatchJobDefinitionQueryDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Job definition query dto cannot be null");
        }

        int offset = (dto.getPageNo() - 1) * dto.getPageSize();

        List<BatchJobDefinitionVO> voList =
                batchJobDefinitionDao.selectPageWithLatestInstance(dto, offset, dto.getPageSize());

        Long total = batchJobDefinitionDao.count(dto);

        return PaginationResult.buildSuc(
                voList,
                dto.getPageNo(),
                dto.getPageSize(),
                total
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public Boolean delete(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        BatchJobDefinition definition = batchJobDefinitionDao.queryById(id);
        if (definition == null) {
            return false;
        }

        validateDelete(id);

        scheduleApplicationService.removeSchedule(id);
        seatunnelJobInstanceService.removeAllByDefinitionId(id);

        return batchJobDefinitionDao.deleteById(id);
    }

    @Override
    public String buildHoconConfig(SeatunnelBatchJobDefinitionDTO dto) {
        validateBuildRequest(dto);

        JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
        return handler.buildHoconConfig(dto);
    }

    private void validateSaveRequest(SeatunnelBatchJobDefinitionDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("DTO cannot be null");
        }
        if (dto.getId() == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }
        if (StringUtils.isBlank(dto.getJobDefinitionInfo())) {
            throw new IllegalArgumentException("Job definition info cannot be null");
        }
    }

    private void validateBuildRequest(SeatunnelBatchJobDefinitionDTO dto) {
        if (dto == null || StringUtils.isBlank(dto.getJobDefinitionInfo())) {
            throw new IllegalArgumentException("Job definition info cannot be null");
        }
    }

    private void validateDelete(Long id) {
        if (seatunnelJobInstanceService.existsRunningInstance(id)) {
            throw new IllegalStateException("Cannot delete job definition: running instance exists.");
        }

        JobSchedule schedule =
                scheduleApplicationService.getByTaskDefinitionId(id);

        if (schedule != null && ScheduleStatusEnum.ACTIVE.equals(schedule.getScheduleStatus())) {
            throw new IllegalStateException("Please offline the schedule before deleting.");
        }
    }
}
