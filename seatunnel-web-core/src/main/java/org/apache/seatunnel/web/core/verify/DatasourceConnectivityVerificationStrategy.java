package org.apache.seatunnel.web.core.verify;

import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.apache.seatunnel.web.spi.enums.DbType;

/**
 * Strategy interface for verifying datasource connectivity from a specific client.
 */
public interface DatasourceConnectivityVerificationStrategy {

    /**
     * Whether this strategy supports the given datasource type.
     */
    boolean supports(DbType dbType);

    /**
     * Verify connectivity between the client and datasource.
     *
     * @param client the execution client
     * @param datasource the target datasource
     * @param timeoutMs verification timeout in milliseconds
     * @param pollIntervalMs polling interval in milliseconds
     * @return verification result
     */
    ClientDatasourceVerifyVO verify(
            SeaTunnelClient client,
            DataSource datasource,
            long timeoutMs,
            long pollIntervalMs
    );
}