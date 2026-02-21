package org.apache.seatunnel.admin.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobExecutorService;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.thirdparty.metrics.JobSubmitter;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.communal.enums.RunMode;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

@Service
@Slf4j
public class SeatunnelJobExecutorServiceImpl implements SeatunnelJobExecutorService {

    @Resource
    private SeatunnelJobInstanceService instanceService;

    @Resource
    private JobSubmitter jobSubmitter;

    @Override
    public Long jobExecute(Long jobDefineId, RunMode runMode) {

        SeatunnelJobInstanceVO instance =
                instanceService.create(jobDefineId, runMode);

        jobSubmitter.submit(
                instance.getId(),
                instance.getJobConfig()
        );

        return instance.getId();
    }

    @Override
    public Long jobPause(Long jobInstanceId) {
        // TODO implement pause
        throw new UnsupportedOperationException("Pause not implemented");
    }

    @Override
    public Long jobStore(Long jobInstanceId) {
        // TODO implement stop
        throw new UnsupportedOperationException("Stop not implemented");
    }
}