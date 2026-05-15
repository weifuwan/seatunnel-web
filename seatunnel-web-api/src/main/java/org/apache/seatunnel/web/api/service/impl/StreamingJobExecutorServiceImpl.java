package org.apache.seatunnel.web.api.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.metrics.JobSubmitter;
import org.apache.seatunnel.web.api.service.StreamingJobExecutorService;
import org.apache.seatunnel.web.api.service.StreamingJobInstanceService;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@Slf4j
public class StreamingJobExecutorServiceImpl implements StreamingJobExecutorService {

    private final StreamingJobInstanceService streamingJobInstanceService;
    private final StreamingJobDefinitionQueryService streamingJobDefinitionQueryService;
    private final JobSubmitter jobSubmitter;

    public StreamingJobExecutorServiceImpl(StreamingJobInstanceService streamingJobInstanceService,
                                           StreamingJobDefinitionQueryService streamingJobDefinitionQueryService,
                                           JobSubmitter jobSubmitter) {
        this.streamingJobInstanceService = streamingJobInstanceService;
        this.streamingJobDefinitionQueryService = streamingJobDefinitionQueryService;
        this.jobSubmitter = jobSubmitter;
    }

    @Override
    public Long jobExecute(Long jobDefineId, RunMode runMode) {
        validateDefinitionId(jobDefineId);
        validateRunnable(jobDefineId);

        if (streamingJobInstanceService.existsRunningInstance(jobDefineId)) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "streaming job already has a running instance"
            );
        }

        JobInstanceVO instance = streamingJobInstanceService.create(jobDefineId, runMode);

        log.info("Streaming job execute requested: jobDefineId={}, runMode={}, instanceId={}",
                jobDefineId, runMode, instance.getId());

        jobSubmitter.submit(instance);

        return instance.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long jobPause(Long jobInstanceId) {
        validateInstanceId(jobInstanceId);

        JobInstanceVO instance = streamingJobInstanceService.selectById(jobInstanceId);
        if (instance == null || instance.getId() == null) {
            throw new ServiceException(Status.BATCH_JOB_INSTANCE_NOT_EXIST);
        }

        if (isFinishedStatus(instance.getJobStatus())) {
            log.info("Streaming job instance already finished, skip pause: instanceId={}, status={}",
                    jobInstanceId, instance.getJobStatus());
            return jobInstanceId;
        }

        log.info("Streaming job pause requested: instanceId={}, status={}",
                jobInstanceId, instance.getJobStatus());

        try {
            jobSubmitter.pause(instance);

            JobInstance update = new JobInstance();
            update.setId(jobInstanceId);
            update.setJobStatus(JobStatus.CANCELED);
            update.setEndTime(new Date());
            update.setErrorMessage("Streaming job was manually paused by user.");

            streamingJobInstanceService.updateById(update);

            log.info("Streaming job pause success: instanceId={}", jobInstanceId);
            return jobInstanceId;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Streaming job pause failed: instanceId={}", jobInstanceId, e);

            JobInstance update = new JobInstance();
            update.setId(jobInstanceId);
            update.setErrorMessage("Streaming job pause failed: " + e.getMessage());
            streamingJobInstanceService.updateById(update);

            throw new ServiceException(Status.JOB_DEFINITION_EXECUTE_ERROR);
        }
    }

    private void validateRunnable(Long jobDefineId) {
        StreamingJobDefinitionEntity definition =
                streamingJobDefinitionQueryService.getDefinitionOrThrow(jobDefineId);

        if (definition.getReleaseState() == null) {
            throw new ServiceException(
                    Status.REQUEST_PARAMS_NOT_VALID_ERROR,
                    "releaseState"
            );
        }

        if (definition.getReleaseState() != ReleaseState.ONLINE) {
            throw new ServiceException(
                    Status.JOB_DEFINITION_EXECUTE_ERROR,
                    "only online streaming job can be executed"
            );
        }
    }

    private void validateDefinitionId(Long jobDefineId) {
        if (jobDefineId == null || jobDefineId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobDefineId");
        }
    }

    private void validateInstanceId(Long jobInstanceId) {
        if (jobInstanceId == null || jobInstanceId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "jobInstanceId");
        }
    }

    private boolean isFinishedStatus(String status) {
        if (status == null) {
            return false;
        }

        return "FINISHED".equalsIgnoreCase(status)
                || "FAILED".equalsIgnoreCase(status)
                || "CANCELED".equalsIgnoreCase(status)
                || "CANCELLED".equalsIgnoreCase(status)
                || "STOPPED".equalsIgnoreCase(status);
    }
}