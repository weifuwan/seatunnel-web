package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.core.job.assembler.StreamingJobDefinitionAssembler;
import org.apache.seatunnel.web.core.job.handler.JobDefinitionModeHandler;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.core.job.registry.JobDefinitionModeHandlerRegistry;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionContentDao;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.StreamingJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.apache.seatunnel.web.spi.enums.JobRuntimeType;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class StreamingJobDefinitionServiceImpl extends BaseServiceImpl implements StreamingJobDefinitionService {

    @Resource
    private JobDefinitionModeHandlerRegistry handlerRegistry;

    @Resource
    private StreamingJobDefinitionDao streamingJobDefinitionDao;

    @Resource
    private StreamingJobDefinitionContentDao streamingJobDefinitionContentDao;

    @Resource
    private StreamingJobDefinitionAssembler streamingJobDefinitionAssembler;

    @Resource
    private StreamingJobDefinitionQueryService definitionQueryService;

    @Override
    public Long saveOrUpdate(StreamingScriptJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public Long saveOrUpdate(StreamingGuideSingleJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Override
    public Long saveOrUpdate(StreamingGuideMultiJobSaveCommand command) {
        return doSaveOrUpdate(command);
    }

    @Transactional(rollbackFor = Exception.class)
    protected Long doSaveOrUpdate(StreamingJobSaveCommand command) {
        validateBase(command);
        validateStreaming(command);

        try {
            Date now = new Date();

            JobDefinitionModeHandler handler = getAndValidateHandler(command);
            JobDefinitionAnalysisResult analysis = handler.analyze(command);
            String definitionContent = handler.serializeDefinition(command);

            StreamingJobDefinitionEntity existing = command.getId() == null
                    ? null
                    : streamingJobDefinitionDao.queryById(command.getId());

            StreamingJobDefinitionEntity entity;
            int nextVersion;

            if (ObjectUtils.isEmpty(existing)) {
                entity = streamingJobDefinitionAssembler.create(command, analysis);
                nextVersion = 1;
            } else {
                nextVersion = existing.getJobVersion() == null ? 1 : existing.getJobVersion() + 1;
                entity = existing;
                streamingJobDefinitionAssembler.update(entity, command, analysis, now, nextVersion);
            }

            streamingJobDefinitionDao.saveOrUpdate(entity);

            StreamingJobDefinitionContentEntity contentEntity =
                    StreamingJobDefinitionContentEntity.builder()
                            .jobDefinitionId(entity.getId())
                            .version(nextVersion)
                            .mode(command.getMode())
                            .contentSchemaVersion(1)
                            .definitionContent(definitionContent)
                            .envConfig(JSONUtils.toJsonString(command.getEnv()))
                            .createTime(now)
                            .build();

            streamingJobDefinitionContentDao.save(contentEntity);

            return entity.getId();
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Save or update streaming job definition failed, command={}", command, e);
            throw new ServiceException(Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public String buildHoconConfig(StreamingScriptJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(StreamingGuideSingleJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    @Override
    public String buildHoconConfig(StreamingGuideMultiJobSaveCommand command) {
        return doBuildHoconConfig(command);
    }

    protected String doBuildHoconConfig(StreamingJobSaveCommand command) {
        validateBase(command);
        validateStreaming(command);

        try {
            JobDefinitionModeHandler handler = getAndValidateHandler(command);
            String hocon = handler.buildHoconConfig(command);

            if (StringUtils.isBlank(hocon)) {
                throw new ServiceException(Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR, "hocon config is empty");
            }
            return hocon;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Build streaming hocon config failed, command={}", command, e);
            throw new ServiceException(Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR);
        }
    }

    @Override
    public StreamingJobDefinitionVO selectById(Long id) {
        return definitionQueryService.selectById(id);
    }

    @Override
    public PaginationResult<StreamingJobDefinitionVO> paging(StreamingJobDefinitionQueryDTO dto) {
        validatePagingRequest(dto);

        try {
            int offset = (dto.getPageNo() - 1) * dto.getPageSize();

            List<StreamingJobDefinitionVO> records =
                    streamingJobDefinitionDao.selectPage(dto, offset, dto.getPageSize());

            Long total = streamingJobDefinitionDao.count(dto);

            return PaginationResult.buildSuc(records, dto.getPageNo(), dto.getPageSize(), total);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition paging failed, dto={}", dto, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean delete(Long jobDefinitionId) {
        validateId(jobDefinitionId);

        StreamingJobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(jobDefinitionId);
        validateDelete(definition.getId());

        try {
            streamingJobDefinitionContentDao.deleteByJobDefinitionId(jobDefinitionId);
            return streamingJobDefinitionDao.deleteById(jobDefinitionId);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Delete streaming job definition failed, id={}", jobDefinitionId, e);
            throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    public JobDefinitionSaveCommand selectEditDetail(Long id) {
        validateId(id);

        try {
            StreamingJobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(id);
            validateEditable(definition);

            StreamingJobDefinitionContentEntity latestContent =
                    streamingJobDefinitionContentDao.queryLatestByJobDefinitionId(id);

            if (latestContent == null) {
                throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST, "streaming definition content not found");
            }

            return definitionQueryService.buildEditCommand(definition, latestContent);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition edit detail failed, id={}", id, e);
            throw new ServiceException(e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateReleaseState(Long id, ReleaseState releaseState) {
        validateId(id);

        if (releaseState == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }

        StreamingJobDefinitionEntity entity = streamingJobDefinitionDao.queryById(id);
        if (entity == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }

        ReleaseState currentState = entity.getReleaseState();

        if (releaseState == currentState) {
            log.info("Streaming job definition release state already synced, id={}, state={}", id, releaseState);
            return true;
        }

        boolean updated = streamingJobDefinitionDao.updateReleaseState(id, releaseState);
        if (!updated) {
            throw new RuntimeException("Failed to update streaming job definition release state");
        }

        log.info("Streaming job definition release state updated, id={}, state={}", id, releaseState);
        return true;
    }

    private JobDefinitionModeHandler getAndValidateHandler(JobDefinitionSaveCommand command) {
        validateBase(command);

        JobDefinitionModeHandler handler = handlerRegistry.getHandler(command.getMode());

        handler.validate(command);
        return handler;
    }

    private void validateStreaming(StreamingJobSaveCommand command) {
        if (command.getRuntimeType() != JobRuntimeType.STREAMING) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "runtimeType");
        }
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
        if (command.getId() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "id");
        }
        if (StringUtils.isBlank(command.getBasic().getJobName())) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobName");
        }
        if (command.getEnv() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "env");
        }
    }

    private void validateEditable(StreamingJobDefinitionEntity definition) {
        if (definition == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }
        if (definition.getReleaseState() == null) {
            throw new RuntimeException("job release state is empty");
        }
        if (!definition.getReleaseState().isOffline()) {
            throw new RuntimeException("only offline streaming job definition can be edited");
        }
    }

    private void validateDelete(Long id) {
        // 后面接 StreamingJobInstanceService 后，在这里判断是否存在运行中的实时实例。
    }

    private void validatePagingRequest(StreamingJobDefinitionQueryDTO dto) {
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
}