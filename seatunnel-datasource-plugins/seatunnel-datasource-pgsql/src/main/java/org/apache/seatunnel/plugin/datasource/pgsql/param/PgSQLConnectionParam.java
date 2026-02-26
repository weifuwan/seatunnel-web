package org.apache.seatunnel.plugin.datasource.pgsql.param;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.communal.BaseConnectionParam;

@Data
@EqualsAndHashCode(callSuper = true)
public class PgSQLConnectionParam extends BaseConnectionParam {

    @Override
    public String toString() {
        return "PgSQLConnectionParam{" +
                "user='" + user + '\'' +
                ", password='" + password + '\'' +
                ", database='" + database + '\'' +
                ", schemaName='" + schemaName + '\'' +
                ", url='" + url + '\'' +
                ", driverLocation='" + driverLocation + '\'' +
                ", driver='" + driver + '\'' +
                ", dbType=" + dbType +
                '}';
    }
}
