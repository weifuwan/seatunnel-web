package org.apache.seatunnel.admin.init;

import org.apache.seatunnel.communal.DbType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import javax.sql.DataSource;
import java.io.InputStreamReader;
import java.io.Reader;
import java.sql.Connection;
import java.util.Locale;


public abstract class UpgradeDao {

    public static final Logger logger = LoggerFactory.getLogger(UpgradeDao.class);

    protected final DataSource dataSource;

    protected UpgradeDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    protected abstract String initSqlPath();

    public abstract DbType getDbType();

    public void initSchema() {
        // Execute the dolphinscheduler full sql
        runInitSql(getDbType());
    }

    /**
     * run init sql to init db schema
     *
     * @param dbType db type
     */
    private void runInitSql(DbType dbType) {
        String sqlFile = String.format("seatunnul_%s.sql", dbType.getDescp().toLowerCase(Locale.ROOT));
        Resource mysqlSQLFilePath = new ClassPathResource("sql/" + sqlFile);
        try (Connection conn = dataSource.getConnection()) {
            // Execute the dolphinscheduler_ddl.sql script to create the table structure of dolphinscheduler
            ScriptRunner initScriptRunner = new ScriptRunner(conn, true, true);
            try (Reader initSqlReader = new InputStreamReader(mysqlSQLFilePath.getInputStream())) {
                initScriptRunner.runScript(initSqlReader);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    public abstract boolean isExistsTable(String tableName);

    public abstract boolean isExistsColumn(String tableName, String columnName);

}
