package org.apache.seatunnel.web.core.verify.job;

import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;

public interface ConnectivityTestJobFactory {

    ConnectivityTestJob build(SeaTunnelClient client, DataSource datasource);
}
