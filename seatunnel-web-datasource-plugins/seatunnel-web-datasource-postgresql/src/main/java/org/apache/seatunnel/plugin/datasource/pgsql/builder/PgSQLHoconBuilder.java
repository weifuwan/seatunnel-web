package org.apache.seatunnel.plugin.datasource.pgsql.builder;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.constants.DataSourceConstants;
import org.apache.seatunnel.plugin.datasource.api.jdbc.AbstractJdbcHoconBuilder;

@Slf4j
public class PgSQLHoconBuilder extends AbstractJdbcHoconBuilder {

    @Override
    protected String defaultDriver() {
        return DataSourceConstants.ORG_POSTGRESQL_DRIVER;
    }

    @Override
    protected String buildTablePath(String database, String schemaName, String table) {
        // PostgreSQL requires schema in table path: database.schema.table
        // If schema is not provided, use default 'public' schema
        String schema = StringUtils.isNotBlank(schemaName) ? schemaName : "public";
        return String.format("%s.%s.%s", database, schema, table);
    }
}