package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
import org.apache.seatunnel.web.api.service.StreamingJobInstanceService;
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

    @Resource
    private StreamingJobInstanceService streamingJobInstanceService;

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
        validatePersistCommand(command);
        validateStreaming(command);

        try {
            SaveContext context = prepareSaveContext(command);

            StreamingJobDefinitionEntity entity = saveDefinition(command, context);
            saveDefinitionContent(command, context, entity);

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
        validatePersistCommand(command);
        validateStreaming(command);

        try {
            JobDefinitionModeHandler handler = getAndValidateHandler(command);
            String hocon = handler.buildHoconConfig(command);

            if (StringUtils.isBlank(hocon)) {
                throw new ServiceException(
                        Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR,
                        "hocon config is empty"
                );
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
        validateId(id);
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
            streamingJobInstanceService.removeAllByDefinitionId(jobDefinitionId);
            streamingJobDefinitionContentDao.deleteByJobDefinitionId(jobDefinitionId);

            boolean deleted = streamingJobDefinitionDao.deleteById(jobDefinitionId);
            if (!deleted) {
                throw new ServiceException(Status.DELETE_BATCH_JOB_DEFINITION_ERROR);
            }

            return true;
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

            StreamingJobDefinitionContentEntity latestContent = getLatestContentOrThrow(id);

            return definitionQueryService.buildEditCommand(definition, latestContent);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Query streaming job definition edit detail failed, id={}", id, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateReleaseState(Long id, ReleaseState releaseState) {
        validateId(id);
        validateReleaseState(releaseState);

        try {
            StreamingJobDefinitionEntity entity = definitionQueryService.getDefinitionOrThrow(id);

            ReleaseState currentState = entity.getReleaseState();
            if (releaseState == currentState) {
                log.info("Streaming job definition release state already synced, id={}, state={}",
                        id, releaseState);
                return true;
            }

            if (releaseState.isOnline()) {
                validateBeforeOnline(id);
            }

            if (releaseState.isOffline()) {
                validateBeforeOffline(id);
            }

            boolean updated = streamingJobDefinitionDao.updateReleaseState(id, releaseState);
            if (!updated) {
                throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR);
            }

            log.info("Streaming job definition release state updated, id={}, from={}, to={}",
                    id, currentState, releaseState);
            return true;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Update streaming job definition release state failed, id={}, state={}",
                    id, releaseState, e);
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR);
        }
    }

    private SaveContext prepareSaveContext(StreamingJobSaveCommand command) {
        JobDefinitionModeHandler handler = getAndValidateHandler(command);
        JobDefinitionAnalysisResult analysis = handler.analyze(command);
        String definitionContent = handler.serializeDefinition(command);

        if (StringUtils.isBlank(definitionContent)) {
            throw new ServiceException(
                    Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR,
                    "definition content is empty"
            );
        }

        StreamingJobDefinitionEntity existing = command.getId() == null
                ? null
                : streamingJobDefinitionDao.queryById(command.getId());

        validateWritable(existing);

        int nextVersion = resolveNextVersion(existing);

        SaveContext context = new SaveContext();
        context.setHandler(handler);
        context.setAnalysis(analysis);
        context.setDefinitionContent(definitionContent);
        context.setExisting(existing);
        context.setNextVersion(nextVersion);
        context.setNow(new Date());
        return context;
    }

    private StreamingJobDefinitionEntity saveDefinition(StreamingJobSaveCommand command, SaveContext context) {
        StreamingJobDefinitionEntity entity;

        if (ObjectUtils.isEmpty(context.getExisting())) {
            entity = streamingJobDefinitionAssembler.create(command, context.getAnalysis());
        } else {
            entity = context.getExisting();
            streamingJobDefinitionAssembler.update(
                    entity,
                    command,
                    context.getAnalysis(),
                    context.getNow(),
                    context.getNextVersion()
            );
        }

        streamingJobDefinitionDao.saveOrUpdate(entity);
        return entity;
    }

    private void saveDefinitionContent(
            StreamingJobSaveCommand command,
            SaveContext context,
            StreamingJobDefinitionEntity entity) {
        if (entity == null || entity.getId() == null) {
            throw new ServiceException(
                    Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR,
                    "streaming definition id is empty"
            );
        }

        StreamingJobDefinitionContentEntity contentEntity =
                StreamingJobDefinitionContentEntity.builder()
                        .jobDefinitionId(entity.getId())
                        .version(context.getNextVersion())
                        .mode(command.getMode())
                        .contentSchemaVersion(1)
                        .definitionContent(context.getDefinitionContent())
                        .envConfig(JSONUtils.toJsonString(command.getEnv()))
                        .build();

        contentEntity.initInsert();
        streamingJobDefinitionContentDao.save(contentEntity);
    }

    private int resolveNextVersion(StreamingJobDefinitionEntity existing) {
        if (existing == null || existing.getJobVersion() == null) {
            return 1;
        }

        return existing.getJobVersion() + 1;
    }

    private JobDefinitionModeHandler getAndValidateHandler(JobDefinitionSaveCommand command) {
        validatePersistCommand(command);

        JobDefinitionModeHandler handler = handlerRegistry.getHandler(command.getMode());
        handler.validate(command);

        return handler;
    }

    private void validateBeforeOnline(Long id) {
        StreamingJobDefinitionEntity definition = definitionQueryService.getDefinitionOrThrow(id);
        StreamingJobDefinitionContentEntity latestContent = getLatestContentOrThrow(id);

        JobDefinitionSaveCommand command = definitionQueryService.buildEditCommand(definition, latestContent);

        if (!(command instanceof StreamingJobSaveCommand)) {
            throw new ServiceException(
                    Status.REQUEST_PARAMS_NOT_VALID_ERROR,
                    "streaming job command"
            );
        }

        String hocon = doBuildHoconConfig((StreamingJobSaveCommand) command);
        if (StringUtils.isBlank(hocon)) {
            throw new ServiceException(
                    Status.BUILD_BATCH_JOB_HOCON_CONFIG_ERROR,
                    "hocon config is empty"
            );
        }
    }

    private void validateBeforeOffline(Long id) {
        if (streamingJobInstanceService.existsRunningInstance(id)) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "streaming job has running instance, please stop it before offline"
            );
        }
    }

    private void validateDelete(Long id) {
        if (streamingJobInstanceService.existsRunningInstance(id)) {
            throw new ServiceException(
                    Status.DELETE_BATCH_JOB_DEFINITION_ERROR,
                    "streaming job has running instance"
            );
        }
    }

    private void validateWritable(StreamingJobDefinitionEntity existing) {
        if (existing == null) {
            return;
        }

        if (existing.getReleaseState() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }

        if (!existing.getReleaseState().isOffline()) {
            throw new ServiceException(
                    Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR,
                    "only offline streaming job definition can be updated"
            );
        }
    }

    private void validateEditable(StreamingJobDefinitionEntity definition) {
        if (definition == null) {
            throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST);
        }

        if (definition.getReleaseState() == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }

        if (!definition.getReleaseState().isOffline()) {
            throw new ServiceException(
                    Status.QUERY_BATCH_JOB_DEFINITION_ERROR,
                    "only offline streaming job definition can be edited"
            );
        }
    }

    private StreamingJobDefinitionContentEntity getLatestContentOrThrow(Long id) {
        StreamingJobDefinitionContentEntity latestContent =
                streamingJobDefinitionContentDao.queryLatestByJobDefinitionId(id);

        if (latestContent == null) {
            throw new ServiceException(
                    Status.BATCH_JOB_DEFINITION_NOT_EXIST,
                    "streaming definition content not found"
            );
        }

        return latestContent;
    }

    private void validateStreaming(StreamingJobSaveCommand command) {
        if (command.getRuntimeType() != JobRuntimeType.STREAMING) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "runtimeType");
        }
    }

    private void validatePersistCommand(JobDefinitionSaveCommand command) {
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

    private void validateReleaseState(ReleaseState releaseState) {
        if (releaseState == null) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "releaseState");
        }
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

    @Data
    private static class SaveContext {
        private JobDefinitionModeHandler handler;
        private JobDefinitionAnalysisResult analysis;
        private String definitionContent;
        private StreamingJobDefinitionEntity existing;
        private Integer nextVersion;
        private Date now;
    }
}