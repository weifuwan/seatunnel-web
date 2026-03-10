package org.apache.seatunnel.admin.init;

import org.apache.seatunnel.communal.DbType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

@Service
public class H2UpgradeDao extends UpgradeDao {
    public static final Logger logger = LoggerFactory.getLogger(H2UpgradeDao.class);

    private H2UpgradeDao(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    protected String initSqlPath() {
        return "sql/seatunnel_h2.sql";
    }

    @Override
    public DbType getDbType() {
        return DbType.H2;
    }

    @Override
    public boolean isExistsTable(String tableName) {
        try (Connection conn = dataSource.getConnection()) {
            try (ResultSet rs = conn.getMetaData().getTables(null, null, tableName.toUpperCase(), new String[]{"TABLE"})) {
                return rs.next();
            }
        } catch (SQLException e) {
            logger.error(e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean isExistsColumn(String tableName, String columnName) {
        try (Connection conn = dataSource.getConnection()) {
            try (ResultSet rs = conn.getMetaData().getColumns(null, null, tableName.toUpperCase(), columnName.toUpperCase())) {
                return rs.next();
            }
        } catch (SQLException e) {
            logger.error(e.getMessage(), e);
            return false;
        }
    }

}