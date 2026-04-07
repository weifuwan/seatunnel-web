package org.apache.seatunnel.web.core.verify;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatasourceConnectivityVerificationStrategyFactory {
    @Resource
    private List<DatasourceConnectivityVerificationStrategy> strategies;

    public DatasourceConnectivityVerificationStrategy getStrategy(DbType dbType) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(dbType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("暂不支持该数据源类型的连通性验证: " + dbType));
    }
}
