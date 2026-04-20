package org.apache.seatunnel.web.core.hocon;

import com.fasterxml.jackson.core.type.TypeReference;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.dao.repository.JobDefinitionContentDao;
import org.apache.seatunnel.web.dao.repository.JobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.*;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Resolve persisted definition data into specific save command.
 */
@Component
@Slf4j
public class DefaultJobDefinitionCommandResolver implements JobDefinitionCommandResolver {

    private final JobDefinitionDao jobDefinitionDao;
    private final JobDefinitionContentDao jobDefinitionContentDao;

    public DefaultJobDefinitionCommandResolver(JobDefinitionDao jobDefinitionDao,
                                               JobDefinitionContentDao jobDefinitionContentDao) {
        this.jobDefinitionDao = jobDefinitionDao;
        this.jobDefinitionContentDao = jobDefinitionContentDao;
    }

    @Override
    public JobDefinitionSaveCommand resolve(Long jobDefinitionId) {
        if (jobDefinitionId == null || jobDefinitionId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefinitionId");
        }

        try {
            JobDefinitionEntity definition = jobDefinitionDao.queryById(jobDefinitionId);
            if (definition == null) {
                throw new ServiceException(Status.JOB_DEFINITION_NOT_EXIST);
            }

            JobDefinitionContentEntity latestContent =
                    jobDefinitionContentDao.queryLatestByJobDefinitionId(jobDefinitionId);
            if (latestContent == null || StringUtils.isBlank(latestContent.getDefinitionContent())) {
                throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST, "definition content not found");
            }

            JobDefinitionMode mode = definition.getMode();
            if (mode == null) {
                throw new ServiceException(Status.BATCH_JOB_DEFINITION_NOT_EXIST, "definition mode not found");
            }

            return buildCommand(definition, latestContent.getDefinitionContent(), definition.getClientId());
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Resolve job definition command failed, jobDefinitionId={}", jobDefinitionId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    /**
     * Build concrete save command from definition entity and persisted content.
     */
    private JobDefinitionSaveCommand buildCommand(JobDefinitionEntity definition, String definitionContent, Long clientId) {
        JobDefinitionMode mode = definition.getMode();

        switch (mode) {
            case SCRIPT:
                return buildScriptCommand(definition, definitionContent);
            case GUIDE_SINGLE:
                return buildGuideSingleCommand(definition, definitionContent);
            case GUIDE_MULTI:
                return buildGuideMultiCommand(definition, definitionContent);
            default:
                throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "unsupported mode: " + mode);
        }
    }

    private ScriptJobSaveCommand buildScriptCommand(JobDefinitionEntity definition, String definitionContent) {
        ScriptJobSaveCommand command = new ScriptJobSaveCommand();
        command.setBasic(buildBasic(definition));
        return command;
    }

    private GuideSingleJobSaveCommand buildGuideSingleCommand(JobDefinitionEntity definition, String definitionContent) {
        GuideSingleJobSaveCommand command = new GuideSingleJobSaveCommand();
        command.setBasic(buildBasic(definition));
        command.setWorkflow(JSONUtils.parseObject(
                definitionContent,
                new TypeReference<Map<String, Object>>() {
                }
        ));
        command.setId(definition.getId());
        return command;
    }

    private GuideMultiJobSaveCommand buildGuideMultiCommand(JobDefinitionEntity definition, String ff) {
        GuideMultiJobSaveCommand command = new GuideMultiJobSaveCommand();
        command.setBasic(buildBasic(definition));
        return command;
    }

    /**
     * Build basic config from persisted definition entity.
     */
    private JobBasicConfig buildBasic(JobDefinitionEntity definition) {
        JobBasicConfig basic = new JobBasicConfig();
        basic.setMode(definition.getMode());
        basic.setJobMode(definition.getJobType());
        basic.setJobName(definition.getJobName());
        basic.setJobDesc(definition.getJobDesc());
        basic.setClientId(definition.getClientId());
        basic.setParallelism(definition.getParallelism());
        return basic;
    }
}