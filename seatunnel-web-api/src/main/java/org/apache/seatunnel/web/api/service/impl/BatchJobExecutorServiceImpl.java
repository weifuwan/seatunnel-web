package org.apache.seatunnel.web.api.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.metrics.JobSubmitter;
import org.apache.seatunnel.web.api.service.BatchJobExecutorService;
import org.apache.seatunnel.web.api.service.BatchJobInstanceService;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@Slf4j
public class BatchJobExecutorServiceImpl implements BatchJobExecutorService {

    private final BatchJobInstanceService instanceService;
    private final JobSubmitter jobSubmitter;

    public BatchJobExecutorServiceImpl(BatchJobInstanceService instanceService,
                                       JobSubmitter jobSubmitter) {
        this.instanceService = instanceService;
        this.jobSubmitter = jobSubmitter;
    }

    @Override
    public Long jobExecute(Long jobDefineId, RunMode runMode) {
        JobInstanceVO instance = instanceService.create(jobDefineId, runMode);

        log.info("Job execute requested: jobDefineId={}, runMode={}, instanceId={}",
                jobDefineId, runMode, instance.getId());

        jobSubmitter.submit(instance);

        return instance.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long jobPause(Long jobInstanceId) {
        validateInstanceId(jobInstanceId);

        JobInstanceVO instance = instanceService.selectById(jobInstanceId);
        if (instance == null || instance.getId() == null) {
            throw new ServiceException(Status.BATCH_JOB_INSTANCE_NOT_EXIST);
        }

        if (isFinishedStatus(instance.getJobStatus())) {
            log.info("Job instance already finished, skip pause: instanceId={}, status={}",
                    jobInstanceId, instance.getJobStatus());
            return jobInstanceId;
        }

        log.info("Job pause requested: instanceId={}, status={}",
                jobInstanceId, instance.getJobStatus());

        try {
            jobSubmitter.pause(instance);

            JobInstance update = new JobInstance();
            update.setId(jobInstanceId);
            update.setJobStatus(JobStatus.CANCELED);
            update.setEndTime(new Date());
            update.setErrorMessage("Job was manually paused by user.");

            instanceService.updateById(update);

            log.info("Job pause success: instanceId={}", jobInstanceId);
            return jobInstanceId;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Job pause failed: instanceId={}", jobInstanceId, e);

            JobInstance update = new JobInstance();
            update.setId(jobInstanceId);
            update.setErrorMessage("Job pause failed: " + e.getMessage());
            instanceService.updateById(update);

            throw new ServiceException(Status.JOB_DEFINITION_EXECUTE_ERROR);
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