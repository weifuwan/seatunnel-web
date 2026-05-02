package org.apache.seatunnel.web.core.time;

import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

@Component
public class MySqlTimeLiteralRenderer implements JdbcTimeLiteralRenderer {

    @Override
    public DbType dbType() {
        return DbType.MYSQL;
    }

    @Override
    public String render(String value, String timeFormat) {
        return "'" + escape(value) + "'";
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("'", "''");
    }
}