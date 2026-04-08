package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;

/**
 * Factory for building connectivity test jobs.
 */
public interface ConnectivityTestJobFactory {

    /**
     * Build a test job for the given client and datasource.
     */
    ConnectivityTestJob build(SeaTunnelClient client, DataSource datasource);
}