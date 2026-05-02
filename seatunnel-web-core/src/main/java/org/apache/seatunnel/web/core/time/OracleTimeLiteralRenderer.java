package org.apache.seatunnel.web.core.time;

import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

@Component
public class OracleTimeLiteralRenderer implements JdbcTimeLiteralRenderer {

    @Override
    public DbType dbType() {
        return DbType.ORACLE;
    }

    @Override
    public String render(String value, String timeFormat) {
        String oracleFormat = toOracleDateFormat(timeFormat);

        if (StringUtils.containsIgnoreCase(timeFormat, "SSS")) {
            return "TO_TIMESTAMP('" + escape(value) + "', '" + oracleFormat + "')";
        }

        return "TO_DATE('" + escape(value) + "', '" + oracleFormat + "')";
    }

    private String toOracleDateFormat(String javaFormat) {
        if (StringUtils.isBlank(javaFormat)) {
            return "YYYY-MM-DD HH24:MI:SS";
        }

        return javaFormat
                .replace("yyyy", "YYYY")
                .replace("MM", "MM")
                .replace("dd", "DD")
                .replace("HH", "HH24")
                .replace("mm", "MI")
                .replace("ss", "SS")
                .replace("SSS", "FF3");
    }

    private String escape(String value) {
        return value == null ? "" : value.replace("'", "''");
    }
}