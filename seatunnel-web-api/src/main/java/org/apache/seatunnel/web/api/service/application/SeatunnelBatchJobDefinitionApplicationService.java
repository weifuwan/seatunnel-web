package org.apache.seatunnel.web.api.service.application;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.service.domain.assembler.BatchJobDefinitionAssembler;
import org.apache.seatunnel.web.api.service.domain.handler.JobDefinitionHandler;
import org.apache.seatunnel.web.api.service.domain.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.api.service.domain.registry.JobDefinitionHandlerRegistry;
import org.apache.seatunnel.web.api.service.domain.repository.SeatunnelBatchJobDefinitionRepository;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.common.bean.entity.PaginationResult;
import org.apache.seatunnel.web.common.bean.po.SeatunnelBatchJobDefinitionPO;
import org.apache.seatunnel.web.common.bean.po.SeatunnelJobSchedulePO;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.web.common.enums.ScheduleStatusEnum;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class SeatunnelBatchJobDefinitionApplicationService {

    @Resource
    private SeatunnelBatchJobDefinitionRepository repository;

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
        SeatunnelBatchJobDefinitionPO existing = repository.findById(dto.getId());

        JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
        JobDefinitionAnalysisResult analysis = handler.analyze(dto);

        SeatunnelBatchJobDefinitionPO po;
        if (existing == null) {
            po = assembler.create(dto, analysis, now);
        } else {
            po = existing;
            assembler.update(po, dto, analysis, now);
        }

        repository.saveOrUpdate(po);

        scheduleApplicationService.saveOrUpdateSchedule(po.getId(), dto);

        return po.getId();
    }

    public SeatunnelBatchJobDefinitionVO selectById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        SeatunnelBatchJobDefinitionPO po = repository.findById(id);
        if (po == null) {
            throw new RuntimeException("Job definition is not exist");
        }

        SeatunnelBatchJobDefinitionVO vo =
                ConvertUtil.sourceToTarget(po, SeatunnelBatchJobDefinitionVO.class);

        SeatunnelJobSchedulePO schedule = scheduleApplicationService.getByTaskDefinitionId(id);
        if (schedule != null) {
            vo.setCronExpression(schedule.getCronExpression());
            vo.setScheduleStatus(schedule.getScheduleStatus());
        }

        return vo;
    }

    public PaginationResult<SeatunnelBatchJobDefinitionVO> paging(SeatunnelBatchJobDefinitionQueryDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Job definition query dto cannot be null");
        }

        int offset = (dto.getPageNo() - 1) * dto.getPageSize();

        List<SeatunnelBatchJobDefinitionVO> voList =
                repository.selectPageWithLatestInstance(dto, offset, dto.getPageSize());

        Long total = repository.count(dto);

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

        SeatunnelBatchJobDefinitionPO definition = repository.findById(id);
        if (definition == null) {
            return false;
        }

        validateDelete(id);

        scheduleApplicationService.removeSchedule(id);
        seatunnelJobInstanceService.removeAllByDefinitionId(id);

        return repository.deleteById(id);
    }

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

        SeatunnelJobSchedulePO schedule =
                scheduleApplicationService.getByTaskDefinitionId(id);

        if (schedule != null && ScheduleStatusEnum.ACTIVE.equals(schedule.getScheduleStatus())) {
            throw new IllegalStateException("Please offline the schedule before deleting.");
        }
    }
}