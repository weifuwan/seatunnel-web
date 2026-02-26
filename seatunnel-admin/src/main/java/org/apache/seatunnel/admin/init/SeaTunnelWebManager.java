package org.apache.seatunnel.admin.init;

import org.apache.seatunnel.communal.DbType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.List;

@Service
public class SeaTunnelWebManager {
    private static final Logger logger = LoggerFactory.getLogger(SeaTunnelWebManager.class);

    private final UpgradeDao upgradeDao;

    public SeaTunnelWebManager(DataSource dataSource, List<UpgradeDao> daos) throws Exception {
        final DbType type = getCurrentDbType(dataSource);
        upgradeDao = daos.stream()
                .filter(it -> it.getDbType() == type)
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Cannot find UpgradeDao implementation for db type: " + type
                ));
    }

    private DbType getCurrentDbType(DataSource dataSource) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            String name = conn.getMetaData().getDatabaseProductName().toUpperCase();
            return DbType.valueOf(name);
        }
    }

    public void initSeaTunnelWeb() {
        this.initSeaTunnelWebSchema();
    }


    public void initSeaTunnelWebSchema() {
        logger.info("Start initializing the SeaTunnelWeb manager table structure");
        upgradeDao.initSchema();
    }
}
