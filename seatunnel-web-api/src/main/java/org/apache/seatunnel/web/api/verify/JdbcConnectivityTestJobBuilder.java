package org.apache.seatunnel.web.api.verify;

import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.springframework.stereotype.Component;

@Component
public class JdbcConnectivityTestJobBuilder {

    public String build(DataSource datasource, String jobName) {
        DbType dbType = datasource.getDbType();
        BaseConnectionParam param =
                DataSourceUtils.buildConnectionParams(dbType, datasource.getConnectionParams());

        String url = safe(param.getUrl());
        String user = safe(param.getUser());
        String password = safe(param.getPassword());

        return ""
                + "env {\n"
                + "  parallelism = 1\n"
                + "  job.mode = \"BATCH\"\n"
                + "}\n"
                + "\n"
                + "source {\n"
                + "  Jdbc {\n"
                + "    url = \"" + escape(url) + "\"\n"
                + "    driver = \"com.mysql.cj.jdbc.Driver\"\n"
                + "    user = \"" + escape(user) + "\"\n"
                + "    password = \"" + escape(password) + "\"\n"
                + "    query = \"select 1 as connectivity_check\"\n"
                + "  }\n"
                + "}\n"
                + "\n"
                + "sink {\n"
                + "  Console {\n"
                + "    parallelism = 1\n"
                + "  }\n"
                + "}\n";
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}