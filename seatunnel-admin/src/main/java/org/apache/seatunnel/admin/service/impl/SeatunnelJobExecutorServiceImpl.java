package org.apache.seatunnel.admin.service.impl;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobExecutorService;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.thirdparty.engine.SeaTunnelEngineProxy;
import org.apache.seatunnel.admin.thirdparty.metrics.EngineMetricsExtractorFactory;
import org.apache.seatunnel.admin.thirdparty.metrics.IEngineMetricsExtractor;
import org.apache.seatunnel.admin.thirdparty.metrics.JobSubmitter;
import org.apache.seatunnel.communal.bean.entity.Engine;
import org.apache.seatunnel.communal.bean.entity.EngineType;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.communal.enums.RunMode;
import org.apache.seatunnel.engine.common.job.JobStatus;
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
        SeatunnelJobInstanceVO jobInstance = instanceService.selectById(jobInstanceId);
        if (getJobStatusFromEngine(jobInstance, jobInstance.getJobEngineId())
                == JobStatus.RUNNING) {
            pauseJobInEngine(jobInstance.getJobEngineId());
        }
        return jobInstanceId;
    }

    @Override
    public Long jobStore(Long jobInstanceId) {
        // TODO implement stop
        throw new UnsupportedOperationException("Stop not implemented");
    }

    private JobStatus getJobStatusFromEngine(@NonNull SeatunnelJobInstanceVO jobInstance, String jobEngineId) {

        Engine engine = new Engine(EngineType.SeaTunnel, "2.3.12");

        IEngineMetricsExtractor engineMetricsExtractor =
                (new EngineMetricsExtractorFactory(engine)).getEngineMetricsExtractor();

        return engineMetricsExtractor.getJobStatus(jobEngineId);
    }

    private void pauseJobInEngine(@NonNull String jobEngineId) {
        SeaTunnelEngineProxy.getInstance().pauseJob(jobEngineId);
    }
}