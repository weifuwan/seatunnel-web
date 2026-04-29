package org.apache.seatunnel.plugin.datasource.oracle.builder;

import com.google.auto.service.AutoService;
import org.apache.seatunnel.plugin.datasource.api.hocon.AbstractJdbcBatchBuilder;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;

@AutoService(DataSourceHoconBuilder.class)
public class OracleBatchBuilder extends AbstractJdbcBatchBuilder {
    @Override
    public String pluginName() {
        return "JDBC-ORACLE";
    }
}
