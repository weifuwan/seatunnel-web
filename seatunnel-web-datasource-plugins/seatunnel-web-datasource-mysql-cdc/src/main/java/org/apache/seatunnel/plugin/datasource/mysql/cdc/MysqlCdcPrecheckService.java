package org.apache.seatunnel.plugin.datasource.mysql.cdc;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.cdc.CdcDatasourcePrecheckItem;
import org.apache.seatunnel.plugin.datasource.api.cdc.CdcDatasourcePrecheckResult;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbType;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Locale;

@Slf4j
public class MysqlCdcPrecheckService {

    public CdcDatasourcePrecheckResult check(String connectionParams) {
        CdcDatasourcePrecheckResult result = new CdcDatasourcePrecheckResult();

        BaseConnectionParam param;
        try {
            param = DataSourceUtils.buildConnectionParams(DbType.MYSQL, connectionParams);
        } catch (Exception e) {
            log.warn("Parse MySQL CDC connection params failed", e);

            result.addItem(CdcDatasourcePrecheckItem.fail(
                    "MYSQL_CDC_CONNECTION_PARAMS",
                    "连接参数解析",
                    e.getMessage(),
                    "可解析出 MySQL 连接参数",
                    "MySQL-CDC 数据源连接参数解析失败"
            ));
            result.refreshSuccess();
            return result;
        }

        DataSourceProcessor processor;
        JdbcConnectionProvider connectionProvider;
        try {
            processor = DataSourceUtils.getDatasourceProcessor(DbType.MYSQL);
            connectionProvider = processor.getConnectionManager();
        } catch (Exception e) {
            log.warn("Get MySQL datasource processor failed", e);

            result.addItem(CdcDatasourcePrecheckItem.fail(
                    "MYSQL_PROCESSOR",
                    "MySQL 数据源插件",
                    e.getMessage(),
                    "可获取 MySQL DataSourceProcessor",
                    "未找到 MySQL 数据源处理插件"
            ));
            result.refreshSuccess();
            return result;
        }

        try (Connection connection = connectionProvider.getConnection(param)) {
            result.addItem(CdcDatasourcePrecheckItem.success(
                    "MYSQL_CDC_DIRECT_CONNECTIVITY",
                    "数据库直连",
                    "连接成功",
                    "连接成功",
                    "可以通过 MySQL 数据源插件连接数据库"
            ));

            checkLogBin(connection, result);
            checkBinlogFormat(connection, result);
            checkBinlogRowImage(connection, result);
            checkServerId(connection, result);
            checkPrivileges(connection, result);

        } catch (Exception e) {
            log.warn("MySQL CDC precheck failed", e);

            result.addItem(CdcDatasourcePrecheckItem.fail(
                    "MYSQL_CDC_DIRECT_CONNECTIVITY",
                    "数据库直连",
                    e.getMessage(),
                    "连接成功",
                    "无法通过 MySQL 数据源插件连接数据库，请检查网络、账号、密码或驱动配置"
            ));
        }

        result.refreshSuccess();
        return result;
    }

    private void checkLogBin(Connection connection, CdcDatasourcePrecheckResult result) {
        String value = queryVariable(connection, "log_bin");

        if ("ON".equalsIgnoreCase(value) || "1".equals(value)) {
            result.addItem(CdcDatasourcePrecheckItem.success(
                    "MYSQL_BINLOG_ENABLED",
                    "binlog 开启状态",
                    value,
                    "ON",
                    "MySQL 已开启 binlog"
            ));
            return;
        }

        result.addItem(CdcDatasourcePrecheckItem.fail(
                "MYSQL_BINLOG_ENABLED",
                "binlog 开启状态",
                StringUtils.defaultIfBlank(value, "未获取到"),
                "ON",
                "MySQL 未开启 binlog，CDC 无法捕获增量变更"
        ));
    }

    private void checkBinlogFormat(Connection connection, CdcDatasourcePrecheckResult result) {
        String value = queryVariable(connection, "binlog_format");

        if ("ROW".equalsIgnoreCase(value)) {
            result.addItem(CdcDatasourcePrecheckItem.success(
                    "MYSQL_BINLOG_FORMAT",
                    "binlog_format",
                    value,
                    "ROW",
                    "binlog_format 配置正确"
            ));
            return;
        }

        result.addItem(CdcDatasourcePrecheckItem.fail(
                "MYSQL_BINLOG_FORMAT",
                "binlog_format",
                StringUtils.defaultIfBlank(value, "未获取到"),
                "ROW",
                "MySQL-CDC 要求 binlog_format 为 ROW"
        ));
    }

    private void checkBinlogRowImage(Connection connection, CdcDatasourcePrecheckResult result) {
        String value = queryVariable(connection, "binlog_row_image");

        if ("FULL".equalsIgnoreCase(value)) {
            result.addItem(CdcDatasourcePrecheckItem.success(
                    "MYSQL_BINLOG_ROW_IMAGE",
                    "binlog_row_image",
                    value,
                    "FULL",
                    "binlog_row_image 配置正确"
            ));
            return;
        }

        result.addItem(CdcDatasourcePrecheckItem.fail(
                "MYSQL_BINLOG_ROW_IMAGE",
                "binlog_row_image",
                StringUtils.defaultIfBlank(value, "未获取到"),
                "FULL",
                "建议设置 binlog_row_image=FULL，避免 UPDATE/DELETE 变更信息不完整"
        ));
    }

    private void checkServerId(Connection connection, CdcDatasourcePrecheckResult result) {
        String value = queryVariable(connection, "server_id");

        if (StringUtils.isBlank(value)) {
            result.addItem(CdcDatasourcePrecheckItem.fail(
                    "MYSQL_SERVER_ID",
                    "server_id",
                    "未获取到",
                    "> 0",
                    "未获取到 server_id"
            ));
            return;
        }

        try {
            long serverId = Long.parseLong(value);
            if (serverId > 0) {
                result.addItem(CdcDatasourcePrecheckItem.success(
                        "MYSQL_SERVER_ID",
                        "server_id",
                        value,
                        "> 0",
                        "server_id 配置正确"
                ));
                return;
            }
        } catch (NumberFormatException ignored) {
            // continue
        }

        result.addItem(CdcDatasourcePrecheckItem.fail(
                "MYSQL_SERVER_ID",
                "server_id",
                value,
                "> 0",
                "MySQL-CDC 要求 server_id 大于 0"
        ));
    }

    private void checkPrivileges(Connection connection, CdcDatasourcePrecheckResult result) {
        String grants = queryGrants(connection);

        if (StringUtils.isBlank(grants)) {
            result.addItem(CdcDatasourcePrecheckItem.fail(
                    "MYSQL_CDC_PRIVILEGES",
                    "CDC 权限",
                    "未获取到授权信息",
                    "SELECT、REPLICATION SLAVE、REPLICATION CLIENT",
                    "未获取到当前用户授权信息，请检查 SHOW GRANTS 权限"
            ));
            return;
        }

        String normalized = grants.toUpperCase(Locale.ROOT);

        boolean hasSelect =
                normalized.contains("SELECT")
                        || normalized.contains("ALL PRIVILEGES");

        boolean hasReplicationSlave =
                normalized.contains("REPLICATION SLAVE")
                        || normalized.contains("REPLICATION REPLICA")
                        || normalized.contains("ALL PRIVILEGES");

        boolean hasReplicationClient =
                normalized.contains("REPLICATION CLIENT")
                        || normalized.contains("ALL PRIVILEGES");

        if (hasSelect && hasReplicationSlave && hasReplicationClient) {
            result.addItem(CdcDatasourcePrecheckItem.success(
                    "MYSQL_CDC_PRIVILEGES",
                    "CDC 权限",
                    "权限满足",
                    "SELECT、REPLICATION SLAVE、REPLICATION CLIENT",
                    "当前用户具备 MySQL-CDC 所需权限"
            ));
            return;
        }

        result.addItem(CdcDatasourcePrecheckItem.fail(
                "MYSQL_CDC_PRIVILEGES",
                "CDC 权限",
                simplifyGrants(grants),
                "SELECT、REPLICATION SLAVE、REPLICATION CLIENT",
                "当前用户可能缺少 CDC 所需权限。建议授权 SELECT、REPLICATION SLAVE、REPLICATION CLIENT"
        ));
    }

    private String queryVariable(Connection connection, String variableName) {
        String sql = "SHOW VARIABLES LIKE '" + variableName + "'";

        try (Statement statement = connection.createStatement();
             ResultSet rs = statement.executeQuery(sql)) {

            if (rs.next()) {
                return rs.getString("Value");
            }

            return null;
        } catch (Exception e) {
            log.warn("Query MySQL variable failed, variable={}", variableName, e);
            return null;
        }
    }

    private String queryGrants(Connection connection) {
        StringBuilder builder = new StringBuilder();

        try (Statement statement = connection.createStatement();
             ResultSet rs = statement.executeQuery("SHOW GRANTS FOR CURRENT_USER")) {

            while (rs.next()) {
                builder.append(rs.getString(1)).append('\n');
            }

            return builder.toString();
        } catch (Exception e) {
            log.warn("Query MySQL grants failed", e);
            return null;
        }
    }

    private String simplifyGrants(String grants) {
        if (StringUtils.isBlank(grants)) {
            return "未获取到";
        }

        String normalized = grants.replace('\n', ' ').trim();

        if (normalized.length() <= 300) {
            return normalized;
        }

        return normalized.substring(0, 300) + "...";
    }
}