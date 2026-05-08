package org.apache.seatunnel.web.core.verify.modal;

import lombok.Builder;
import lombok.Data;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.enums.DbType;

@Data
@Builder
public class DatasourceVerifyContext {

    private SeaTunnelClient client;

    private DataSource datasource;

    private DbType dbType;

    private String pluginName;

    private String connectorType;

    private String role;

    private long timeoutMs;

    private long pollIntervalMs;
}