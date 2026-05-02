package org.apache.seatunnel.web.core.time;

import org.apache.seatunnel.web.spi.enums.DbType;

public interface JdbcTimeLiteralRenderer {

    DbType dbType();

    String render(String value, String timeFormat);
}