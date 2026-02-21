package org.apache.seatunnel.plugin.datasource.api.hocon.cdc;

import com.typesafe.config.Config;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;

public class PostgresCdcBuilder implements DataSourceHoconBuilder {
    @Override
    public Config buildSourceHocon(String connectionParam, Config config, JdbcConnectionProvider jdbcConnectionProvider) {
        return null;
    }

    @Override
    public Config buildSinkHocon(String connectionParam, Config config) {
        throw new UnsupportedOperationException("CDC does not support sink");
    }

    @Override
    public String pluginName() {
        return null;
    }
}
