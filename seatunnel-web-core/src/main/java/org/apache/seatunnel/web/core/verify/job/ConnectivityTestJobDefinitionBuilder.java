package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.enums.DbType;

/**
 * Builder for datasource-specific connectivity test job definitions.
 */
public interface ConnectivityTestJobDefinitionBuilder {

    /**
     * Whether this builder supports the given datasource type.
     */
    boolean supports(DbType dbType);

    /**
     * Build a connectivity test job for the given client and datasource.
     */
    ConnectivityTestJob build(SeaTunnelClient client, DataSource datasource);
}