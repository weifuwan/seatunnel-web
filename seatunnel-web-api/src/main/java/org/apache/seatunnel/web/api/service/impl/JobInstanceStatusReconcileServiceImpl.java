package org.apache.seatunnel.web.api.service.impl;//package org.apache.seatunnel.web.api.service.support.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.support.JobInstanceStatusReconcileService;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.dao.repository.JobInstanceDao;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class JobInstanceStatusReconcileServiceImpl implements JobInstanceStatusReconcileService {

    @Resource
    private JobInstanceDao jobInstanceDao;

    @Resource
    private SeaTunnelRestClient seatunnelRestClient;

    @Override
    public void reconcileInstanceStatus(Long instanceId) {
        if (instanceId == null) {
            return;
        }

        JobInstance instance = jobInstanceDao.queryById(instanceId);
        if (instance == null) {
            return;
        }

        reconcileSingleInstance(instance);
    }

    @Override
    public void reconcileUnfinishedInstanceStatuses() {
//        List<JobInstance> instances = jobInstanceDao.selectList(
//                new LambdaQueryWrapper<JobInstance>()
//                        .in(JobInstance::getJobStatus,
//                                JobStatus.INITIALIZING,
//                                JobStatus.CREATED,
//                                JobStatus.PENDING,
//                                JobStatus.SCHEDULED,
//                                JobStatus.RUNNING,
//                                JobStatus.FAILING,
//                                JobStatus.DOING_SAVEPOINT,
//                                JobStatus.CANCELING)
//        );
//
//        if (instances == null || instances.isEmpty()) {
//            return;
//        }
//
//        for (JobInstance instance : instances) {
//            try {
//                reconcileSingleInstance(instance);
//            } catch (Exception e) {
//                log.error("Reconcile instance status failed, instanceId={}", instance.getId(), e);
//            }
//        }
    }

    private void reconcileSingleInstance(JobInstance instance) {
        if (instance == null) {
            return;
        }

        JobStatus current = instance.getJobStatus();
        if (current != null && current.isEndState()) {
            return;
        }

        Long engineJobId = instance.getEngineJobId();
        JobStatus actualStatus = queryActualJobStatus(engineJobId);

        instance.setJobStatus(actualStatus);
        instance.setLastStatusSyncTime(new Date());
        instance.setUpdateTime(new Date());

        if (actualStatus != null && actualStatus.isEndState()) {
            instance.setEndTime(new Date());
        }

        jobInstanceDao.updateById(instance);
    }

    private JobStatus queryActualJobStatus(Long engineJobId) {
        try {
            Map<?, ?> jobInfo = seatunnelRestClient.jobInfo(1L,engineJobId);
            JobStatus status = parseJobStatus(jobInfo);
            if (status != null) {
                return status;
            }
        } catch (Exception e) {
            log.warn("Query job-info failed, engineJobId={}", engineJobId, e);
        }

        JobStatus status = queryFromFinishedJobs(engineJobId);
        if (status != null) {
            return status;
        }

        return JobStatus.UNKNOWABLE;
    }

    private JobStatus queryFromFinishedJobs(Long engineJobId) {
        for (JobStatus candidate : new JobStatus[]{
                JobStatus.FINISHED,
                JobStatus.FAILED,
                JobStatus.CANCELED,
                JobStatus.UNKNOWABLE
        }) {
            try {
                List<?> jobs = seatunnelRestClient.finishedJobs(1L,candidate.name());
                if (containsEngineJobId(jobs, engineJobId)) {
                    return candidate;
                }
            } catch (Exception e) {
                log.warn("Query finished-jobs failed, state={}, engineJobId={}",
                        candidate.name(), engineJobId, e);
            }
        }
        return null;
    }

    private boolean containsEngineJobId(List<?> jobs, Long engineJobId) {
        if (jobs == null || jobs.isEmpty()) {
            return false;
        }

        for (Object job : jobs) {
            if (!(job instanceof Map)) {
                continue;
            }

            Map<?, ?> map = (Map<?, ?>) job;
            Object id = firstNonNull(
                    map.get("jobId"),
                    map.get("job_id"),
                    map.get("id"),
                    map.get("jobEngineId")
            );

            if (id != null && Objects.equals(String.valueOf(id), String.valueOf(engineJobId))) {
                return true;
            }
        }
        return false;
    }

    private JobStatus parseJobStatus(Map<?, ?> result) {
        if (result == null || result.isEmpty()) {
            return null;
        }

        Object value = firstNonNull(
                result.get("jobStatus"),
                result.get("status"),
                result.get("state")
        );

        if (value == null) {
            return null;
        }

        try {
            return JobStatus.fromString(String.valueOf(value));
        } catch (Exception e) {
            log.warn("Unknown job status value: {}", value);
            return null;
        }
    }

    private Object firstNonNull(Object... values) {
        if (values == null) {
            return null;
        }
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}
