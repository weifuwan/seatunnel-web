package org.apache.seatunnel.web.api.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.SeaTunnelJobExecutorService;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.apache.seatunnel.web.api.thirdparty.metrics.JobSubmitter;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.springframework.stereotype.Service;


@Service
@Slf4j
public class SeaTunnelJobExecutorServiceImpl implements SeaTunnelJobExecutorService {

    private final SeaTunnelJobInstanceService instanceService;
    private final JobSubmitter jobSubmitter;

    public SeaTunnelJobExecutorServiceImpl(SeaTunnelJobInstanceService instanceService,
                                           JobSubmitter jobSubmitter) {
        this.instanceService = instanceService;
        this.jobSubmitter = jobSubmitter;
    }


    @Override
    public Long jobExecute(Long jobDefineId, RunMode runMode) {

        SeatunnelJobInstanceVO instance = instanceService.create(jobDefineId, runMode);

        Long instanceId = instance.getId();
        String runtimeConfig = instance.getRuntimeConfig();

        log.info("Job execute requested: jobDefineId={}, runMode={}, instanceId={}",
                jobDefineId, runMode, instanceId);

        jobSubmitter.submit(instanceId, runtimeConfig);

        return instanceId;

    }

    @Override
    public Long jobPause(Long jobInstanceId) {
        // TODO: 你后面要做 pause/stop，需要对接 restClient stopJob/savepoint 等
        SeatunnelJobInstanceVO jobInstance = instanceService.selectById(jobInstanceId);
        return jobInstanceId;
    }

    @Override
    public Long jobStore(Long jobInstanceId) {
        // TODO implement stop
        throw new UnsupportedOperationException("Stop not implemented");
    }
}