package org.apache.seatunnel.plugin.datasource.api.jdbc;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.FrontedTableColumn;
import org.apache.seatunnel.communal.QueryResult;
import org.apache.seatunnel.plugin.datasource.api.modal.DataSourceTableColumn;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
public abstract class AbstractJdbcCatalog implements JdbcCatalog {

    private static final String COUNT_DATA_TEMPLATE =
            "SELECT COUNT(*) FROM `%s`";

    private static final String COUNT_SPECIFIED_TEMPLATE =
            "SELECT COUNT(*) FROM ( `%s` ) temp_count_table";

    private final BaseConnectionParam param;

    private final JdbcConnectionProvider connectionManager;

    public AbstractJdbcCatalog(BaseConnectionParam param, JdbcConnectionProvider connectionManager) {
        this.param = param;
        this.connectionManager = connectionManager;
    }

    @FunctionalInterface
    public interface ResultSetConsumer<T> {
        T apply(ResultSet rs) throws SQLException;
    }

    @Override
    public List<String> listTables() {
        try {
            return queryString(getListTableSql(this.param.getDatabase()), this::getTableName);
        } catch (Exception e) {
            throw new RuntimeException(
                    String.format("Failed listing database in catalog %s", param.getDbType()), e);
        }
    }


    @Override
    public List<DataSourceTableColumn> listColumns(Map<String, Object> requestBody) throws SQLException {
        List<DataSourceTableColumn> columns = new ArrayList<>();
        QueryRequest request = QueryRequest.from(requestBody, param);
        String sql = request.getTaskExecuteType()
                .strategy()
                .buildSelectColumnsSql(this, request);
        buildColumnsWithErrorCheck(executeSql(sql), columns);
        return columns;
    }

    @Override
    public QueryResult getTop20Data(Map<String, Object> requestBody) {
        QueryRequest request = QueryRequest.from(requestBody, param);
        String sql = request.getTaskExecuteType()
                .strategy()
                .buildTopSql(this, request);
        return executeSql(sql);
    }

    @Override
    public Integer count(Map<String, Object> requestBody) {
        QueryRequest request = QueryRequest.from(requestBody, param);
        String sql = request.getTaskExecuteType()
                .strategy()
                .buildCountSql(this, request);
        return extractCount(executeSql(sql));
    }

    /**
     * Applies a database-specific row limit to the given SQL statement.
     *
     * <p>This method is responsible for adding the appropriate limiting
     * syntax (such as {@code LIMIT}, {@code ROWNUM}, or {@code FETCH FIRST})
     * based on the underlying database implementation.</p>
     *
     * <p>The default implementation throws {@link UnsupportedOperationException}
     * and must be overridden by subclasses that support limiting result sets.</p>
     *
     * @param sql   the original SQL query without any limit clause
     * @param limit the maximum number of rows to return
     * @return a new SQL string with the limit applied
     * @throws UnsupportedOperationException if the database does not support
     *                                       or has not implemented row limiting
     */
    protected String applyLimit(String sql, int limit) {
        throw new UnsupportedOperationException();
    }


    /**
     * Extracts the count value from a {@link QueryResult} returned by a
     * {@code COUNT(*)} query.
     *
     * <p>The expected result set contains exactly one row and one column,
     * where the column value represents the total number of records.</p>
     *
     * <p>If the result is {@code null} or contains no rows, this method
     * returns {@code 0} as a safe default.</p>
     *
     * @param result the {@link QueryResult} produced by executing a count SQL
     * @return the extracted count value, or {@code 0} if no data is present
     * @throws NumberFormatException if the count value cannot be converted
     *                               to an integer
     */
    protected Integer extractCount(QueryResult result) {
        if (result == null || result.getData().isEmpty()) {
            return 0;
        }
        Map<String, Object> row = result.getData().get(0);
        Object value = row.values().iterator().next();
        return value == null ? 0 : Integer.parseInt(value.toString());
    }


    /**
     * Iterates the given {@link ResultSet} and converts each row into a
     * {@link DataSourceTableColumn}, adding it to the provided list.
     * Any runtime exception thrown during column building is wrapped with a
     * descriptive message to ease debugging.
     *
     * @param queryResult result of the column metadata query
     * @param columns     list to populate; must be mutable
     */
    protected void buildColumnsWithErrorCheck(QueryResult queryResult, List<DataSourceTableColumn> columns) {
        queryResult.getData().forEach(row -> {
            columns.add(buildColumn(row));
        });
    }

    /**
     * Returns the SQL statement used to fetch column metadata for the given table.
     * Typically, query the information schema or system tables.
     *
     * @param tablePath fully qualified table identifier
     * @return SQL text ready for parameter substitution
     */
    protected String getSelectColumnsSql(TablePath tablePath) {
        throw new UnsupportedOperationException();
    }

    protected DataSourceTableColumn buildColumn(Map<String, Object> item) {
        throw new UnsupportedOperationException();
    }

    protected String parseQueryColumnSql(String query) {
        List<DataSourceTableColumn> columns = new ArrayList<>();
        try (Connection connection = getConnection()) {
            ResultSetMetaData metaData = connection.prepareStatement(query).getMetaData();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                DataSourceTableColumn column = new DataSourceTableColumn();
                column.setColumnName(metaData.getColumnName(i));
                column.setColumnType(metaData.getColumnTypeName(i));
                column.setSourceType(metaData.getColumnTypeName(i));
                column.setOrdinalPosition(i);
                columns.add(column);
            }

            TablePath tablePath = TablePath.of(
                    param.getDatabase(),
                    param.getSchemaName(),
                    metaData.getTableName(1)
            );

            return getSpecifiedColumnSql(tablePath, columns);
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }

    }

    protected String getSpecifiedColumnSql(TablePath tablePath, List<DataSourceTableColumn> columns) {
        throw new UnsupportedOperationException();
    }

    /**
     * Constructs a SQL query to count all records in the specified table.
     * This method generates a sql like "SELECT COUNT(*)" statement for the given table name.
     *
     * @param tableName the name of the table to count rows from
     * @return a SQL COUNT query string
     */
    protected String buildCountQuery(String tableName) {
        return String.format(
                COUNT_DATA_TEMPLATE, tableName
        );
    }

    /**
     * Wraps an existing SQL query with a COUNT function to return the total number of rows.
     * This method transforms a standard SELECT query into a query that returns a single count value.
     *
     * @param query the original SQL query to be wrapped
     * @return a SQL query string that returns the row count of the original query results
     */
    protected String wrapCountQuery(String query) {
        return String.format(
                COUNT_SPECIFIED_TEMPLATE, query.trim()
        );
    }

    /**
     * Returns the SQL statement that lists all tables in the specified database.
     *
     * @param databaseName database (catalog) name
     * @return SQL text
     */
    protected String getListTableSql(String databaseName) {
        throw new UnsupportedOperationException();
    }

    /**
     * Extracts the table name from a result row returned by {@link #getListTableSql(String)}.
     * If the database uses schemas, the returned string is {@code schema.table}.
     *
     * @param rs result set positioned on the current row
     * @return qualified table name, or {@code null} to skip the row
     * @throws SQLException if column access fails
     */
    protected String getTableName(ResultSet rs) throws SQLException {
        String schemaName = rs.getString(1);
        String tableName = rs.getString(2);
        if (StringUtils.isNotBlank(schemaName)) {
            return schemaName + "." + tableName;
        }
        return null;
    }

    /**
     * Utility method that executes a SQL query and converts each row into an object
     * of type {@code T} using the provided extractor function. Rows that map to
     * {@code null} are omitted from the returned list.
     *
     * @param sql      SQL text to execute
     * @param consumer row extractor
     * @return list of extracted values, never {@code null}
     * @throws SQLException if the query fails
     */
    protected List<String> queryString(String sql, ResultSetConsumer<String> consumer)
            throws SQLException {
        try (PreparedStatement ps = getConnection().prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<String> result = new ArrayList<>();
            while (rs.next()) {
                String value = consumer.apply(rs);
                if (value != null) {
                    result.add(value);
                }
            }
            return result;
        }
    }

    /**
     * Provides a database connection by delegating to the underlying connection manager.
     * This method encapsulates the logic for obtaining a connection based on the current
     * configuration parameters. It is typically used by data access methods that require
     * a connection to execute SQL operations.
     *
     * @return a database connection, never {@code null}
     * @throws SQLException if the connection cannot be obtained, for instance due to
     *                      configuration errors, network issues, or resource exhaustion
     */
    protected Connection getConnection() throws SQLException {
        return connectionManager.getConnection(param);
    }

    /**
     * Executes the provided SQL statement and returns the resulting {@link ResultSet}.
     *
     * @param sql the SQL query string to be executed
     * @return a ResultSet containing the data produced by the SQL query
     */
    private QueryResult executeSql(String sql) {
        try (Connection connection = getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(sql)) {
                // Will there exist concurrent drop for one table?
                return processResultSet(ps.executeQuery());
            } catch (SQLException e) {
                throw new RuntimeException(String.format("Failed executeSql error %s", sql), e);
            }
        } catch (SQLException | RuntimeException sqlException) {
            throw new RuntimeException();
        }
    }

    /**
     * Processes a {@link ResultSet} to construct a {@link QueryResult} object.
     * This method iterates through the provided result set, extracts the metadata
     * (column names and types), retrieves the data rows, and packages them into a
     * structured QueryResult containing both the data and its corresponding metadata.
     *
     * @param resultSet the JDBC ResultSet to be processed, typically obtained from executing a database query
     * @return a fully populated QueryResult object containing the column metadata and the row data
     */
    private static QueryResult processResultSet(ResultSet resultSet) {
        try {
            ResultSetMetaData metaData = resultSet.getMetaData();
            int columnCount = metaData.getColumnCount();

            List<FrontedTableColumn> columns = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                String columnName = metaData.getColumnName(i);
                FrontedTableColumn column = new FrontedTableColumn();
                column.setTitle(columnName);
                column.setDataIndex(columnName);
                column.setKey(columnName);
                column.setEllipsis(true);
                columns.add(column);
            }

            List<Map<String, Object>> data = new ArrayList<>();
            while (resultSet.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getString(i);
                    row.put(columnName, value);
                }
                data.add(row);
            }

            if(data.size() == 0) {
                throw new RuntimeException("table is not exist");
            }
            return new QueryResult(columns, data);
        } catch (SQLException sqlException) {
            throw new RuntimeException("processResultSet error", sqlException);
        } finally {
            closeResultSet(resultSet);
        }
    }

    private static void closeResultSet(ResultSet resultSet) {
        if (resultSet != null) {
            try {
                resultSet.close();
            } catch (SQLException e) {
                log.error("Close resultSet error: {}", e.getMessage());
            }
        }
    }

}