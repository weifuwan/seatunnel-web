package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.core.job.registry.StreamingJobEditCommandBuilderRegistry;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StreamingJobDefinitionQueryService {

    @Resource
    private StreamingJobDefinitionDao streamingJobDefinitionDao;

    @Resource
    private StreamingJobEditCommandBuilderRegistry editCommandBuilderRegistry;

    public StreamingJobDefinitionVO selectById(Long id) {
        validateId(id);

        try {
            StreamingJobDefinitionEntity entity = getDefinitionOrThrow(id);
            return ConvertUtil.sourceToTarget(entity, StreamingJobDefinitionVO.class);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition by id failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    public StreamingJobDefinitionEntity getDefinitionOrThrow(Long id) {
        validateId(id);

        StreamingJobDefinitionEntity entity = streamingJobDefinitionDao.queryById(id);
        if (entity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }
        return entity;
    }

    public JobDefinitionSaveCommand buildEditCommand(StreamingJobDefinitionEntity definition,
                                                     StreamingJobDefinitionContentEntity contentEntity) {
        if (definition == null || contentEntity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }

        return editCommandBuilderRegistry
                .getBuilder(definition.getMode())
                .build(definition, contentEntity);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
    }
}