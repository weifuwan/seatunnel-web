package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.common.enums.RunMode;

/**
 * Service interface for executing and managing streaming SeaTunnel jobs.
 */
public interface StreamingJobExecutorService {

    /**
     * Execute a streaming SeaTunnel job based on the streaming job definition ID.
     *
     * @param jobDefineId streaming job definition id
     * @param runMode run mode
     * @return job instance id
     */
    Long jobExecute(Long jobDefineId, RunMode runMode);

    /**
     * Pause a running streaming job instance.
     *
     * @param jobInstanceId job instance id
     * @return job instance id
     */
    Long jobPause(Long jobInstanceId);
}