package org.apache.seatunnel.plugin.datasource.pgsql.builder;

import com.google.auto.service.AutoService;
import org.apache.seatunnel.plugin.datasource.api.hocon.AbstractJdbcBatchBuilder;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;

@AutoService(DataSourceHoconBuilder.class)
public class PgSQLBatchBuilder extends AbstractJdbcBatchBuilder {
    @Override
    public String pluginName() {
        return "JDBC-PGSQL";
    }
}
