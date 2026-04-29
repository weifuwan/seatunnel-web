package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.common.enums.RunMode;

/**
 * Service interface for executing and managing SeaTunnel jobs.
 * <p>
 * Provides capabilities to execute, pause, store, and run ad-hoc jobs.
 */
public interface BatchJobExecutorService {

    /**
     * Execute a SeaTunnel job based on the job definition ID.
     *
     * @param jobDefineId the ID of the job definition
     * @return the job instance ID created after execution
     */
    Long jobExecute(Long jobDefineId, RunMode runMode);

    /**
     * Pause a running SeaTunnel job instance.
     *
     * @param jobInstanceId the ID of the job instance
     * @return the job instance ID after pause operation
     */
    Long jobPause(Long jobInstanceId);

    /**
     * Store (persist or archive) a SeaTunnel job instance.
     *
     * @param jobInstanceId the ID of the job instance
     * @return the job instance ID after store operation
     */
    Long jobStore(Long jobInstanceId);


}
