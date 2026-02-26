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
public class MySQLUpgradeDao extends UpgradeDao {
    public static final Logger logger = LoggerFactory.getLogger(MySQLUpgradeDao.class);

    private MySQLUpgradeDao(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    protected String initSqlPath() {
        return "create/release-1.0.0_schema/mysql";
    }

    @Override
    public DbType getDbType() {
        return DbType.MYSQL;
    }

    /**
     * determines whether a table exists
     * @param tableName tableName
     * @return if table exist return true，else return false
     */
    @Override
    public boolean isExistsTable(String tableName) {
        ResultSet rs = null;
        Connection conn = null;
        try {
            conn = dataSource.getConnection();
            rs = conn.getMetaData().getTables(conn.getCatalog(), conn.getSchema(), tableName, null);
            return rs.next();
        } catch (SQLException e) {
            logger.error(e.getMessage(),e);
            throw new RuntimeException(e.getMessage(),e);
        } finally {
            ConnectionUtils.releaseResource(rs, conn);
        }

    }

    /**
     * determines whether a field exists in the specified table
     * @param tableName tableName
     * @param columnName columnName
     * @return  if column name exist return true，else return false
     */
    @Override
    public boolean isExistsColumn(String tableName,String columnName) {
        Connection conn = null;
        try {
            conn = dataSource.getConnection();
            ResultSet rs = conn.getMetaData().getColumns(conn.getCatalog(), conn.getSchema(),tableName,columnName);
            return rs.next();

        } catch (SQLException e) {
            logger.error(e.getMessage(),e);
            throw new RuntimeException(e.getMessage(),e);
        } finally {
            ConnectionUtils.releaseResource(conn);
        }

    }

}
