package org.apache.seatunnel.web.core.verify.executor;

import org.apache.seatunnel.web.core.verify.job.ConnectivityTestJob;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;

public interface SeaTunnelTestJobExecutor {

    JobExecutionResult executeAndWait(
            SeaTunnelClient client,
            ConnectivityTestJob job,
            long timeoutMs,
            long pollIntervalMs
    );
}
