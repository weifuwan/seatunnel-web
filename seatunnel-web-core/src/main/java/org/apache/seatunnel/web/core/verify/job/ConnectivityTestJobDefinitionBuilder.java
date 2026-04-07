package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.enums.DbType;

public interface ConnectivityTestJobDefinitionBuilder {

    boolean supports(DbType dbType);

    ConnectivityTestJob build(SeaTunnelClient client, DataSource datasource);
}
