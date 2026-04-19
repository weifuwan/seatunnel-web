package org.apache.seatunnel.web.core.hocon;


import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.dao.repository.JobDefinitionContentDao;
import org.apache.seatunnel.web.dao.repository.JobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.GuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.ScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Component;

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

            return parseCommand(mode, latestContent.getDefinitionContent());
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Resolve job definition command failed, jobDefinitionId={}", jobDefinitionId, e);
            throw new ServiceException(Status.QUERY_BATCH_JOB_DEFINITION_ERROR);
        }
    }

    /**
     * Parse latest definition content into specific save command.
     */
    private JobDefinitionSaveCommand parseCommand(JobDefinitionMode mode, String definitionContent) {
        switch (mode) {
            case SCRIPT:
                return JSONUtils.parseObject(definitionContent, ScriptJobSaveCommand.class);
            case GUIDE_SINGLE:
                return JSONUtils.parseObject(definitionContent, GuideSingleJobSaveCommand.class);
            case GUIDE_MULTI:
                return JSONUtils.parseObject(definitionContent, GuideMultiJobSaveCommand.class);
            default:
                throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "unsupported mode: " + mode);
        }
    }
}
