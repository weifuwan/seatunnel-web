package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;

import org.apache.seatunnel.web.api.service.application.streaming.StreamingJobLifecycleService;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.core.job.assembler.StreamingJobDefinitionAssembler;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.core.job.registry.JobDefinitionHandlerRegistry;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinition;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class StreamingJobDefinitionServiceImpl implements StreamingJobDefinitionService {

    @Resource
    private StreamingJobDefinitionDao repository;

    @Resource
    private JobDefinitionHandlerRegistry handlerRegistry;

    @Resource
    private StreamingJobDefinitionAssembler assembler;

    @Resource
    private StreamingJobLifecycleService streamingJobLifecycleService;

    @Transactional(rollbackFor = Exception.class)
    public Long saveOrUpdate(SeatunnelStreamingJobDefinitionDTO dto) {
        validateSaveRequest(dto);

        Date now = new Date();
        StreamingJobDefinition existing = repository.queryById(dto.getId());
        if (existing != null) {
            streamingJobLifecycleService.validateCanUpdate(dto.getId());
        }

        JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
        JobDefinitionAnalysisResult analysis = handler.analyze(dto);

        StreamingJobDefinition po;
        if (existing == null) {
            po = assembler.create(dto, analysis, now);
        } else {
            po = existing;
            assembler.update(po, dto, analysis, now);
        }

        repository.saveOrUpdate(po);
        return po.getId();
    }

    public StreamingJobDefinitionVO selectById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        StreamingJobDefinition po = repository.queryById(id);
        if (po == null) {
            throw new RuntimeException("Job definition is not exist");
        }

        return ConvertUtil.sourceToTarget(po, StreamingJobDefinitionVO.class);
    }

    public PaginationResult<StreamingJobDefinitionVO> paging(StreamingJobDefinitionQueryDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Job definition query dto cannot be null");
        }

        int offset = (dto.getPageNo() - 1) * dto.getPageSize();

        List<StreamingJobDefinitionVO> voList =
                repository.selectPageWithLatestInstance(dto, offset, dto.getPageSize());

        Long total = repository.count(dto);

        return PaginationResult.buildSuc(voList, dto.getPageNo(), dto.getPageSize(), total);
    }

    @Transactional(rollbackFor = Exception.class)
    public Boolean delete(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        StreamingJobDefinition po = repository.queryById(id);
        if (po == null) {
            return false;
        }

        streamingJobLifecycleService.validateCanDelete(id);
        return repository.deleteById(id);
    }

    @Override
    public String buildHoconConfig(SeatunnelStreamJobDefinitionDTO dto) {
        return null;
    }

    public String buildHoconConfig(SeatunnelStreamingJobDefinitionDTO dto) {
        validateBuildRequest(dto);
        JobDefinitionHandler handler = handlerRegistry.getHandler(dto);
        return handler.buildHoconConfig(dto);
    }

    public void deploy(Long jobDefinitionId) {
        streamingJobLifecycleService.deploy(jobDefinitionId);
    }

    public void start(Long jobDefinitionId) {
        streamingJobLifecycleService.start(jobDefinitionId);
    }

    public void stop(Long jobDefinitionId) {
        streamingJobLifecycleService.stop(jobDefinitionId);
    }

    public void restart(Long jobDefinitionId) {
        streamingJobLifecycleService.restart(jobDefinitionId);
    }

    private void validateSaveRequest(SeatunnelStreamingJobDefinitionDTO dto) {
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

    private void validateBuildRequest(SeatunnelStreamingJobDefinitionDTO dto) {
        if (dto == null || StringUtils.isBlank(dto.getJobDefinitionInfo())) {
            throw new IllegalArgumentException("Job definition info cannot be null");
        }
    }
}
