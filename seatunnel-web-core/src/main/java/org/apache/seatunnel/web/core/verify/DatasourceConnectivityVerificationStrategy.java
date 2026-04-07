package org.apache.seatunnel.web.core.verify;


import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.apache.seatunnel.web.spi.enums.DbType;

public interface DatasourceConnectivityVerificationStrategy {

    boolean supports(DbType dbType);

    ClientDatasourceVerifyVO verify(
            SeaTunnelClient client,
            DataSource datasource,
            long timeoutMs,
            long pollIntervalMs
    );
}
