package org.apache.seatunnel.web.api.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.metrics.JobSubmitter;
import org.apache.seatunnel.web.api.service.BatchJobExecutorService;
import org.apache.seatunnel.web.api.service.BatchJobInstanceService;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.springframework.stereotype.Service;

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
    public Long jobPause(Long jobInstanceId) {
        // TODO: integrate restClient stopJob / savepoint later
        JobInstanceVO jobInstance = instanceService.selectById(jobInstanceId);
        return jobInstance.getId();
    }

    @Override
    public Long jobStore(Long jobInstanceId) {
        // TODO implement stop
        throw new UnsupportedOperationException("Stop not implemented");
    }
}