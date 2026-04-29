package org.apache.seatunnel.plugin.datasource.oracle.param;


import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbConnectType;

public class OracleConnectionParam extends BaseConnectionParam {

    protected DbConnectType connectType;

    public DbConnectType getConnectType() {
        return connectType;
    }

    public void setConnectType(DbConnectType connectType) {
        this.connectType = connectType;
    }

    @Override
    public String toString() {
        return "OracleConnectionParam{" +
                "user='" + user + '\'' +
                ", password='" + password + '\'' +
                ", database='" + database + '\'' +
                ", schemaName='" + schemaName + '\'' +
                ", url='" + url + '\'' +
                ", driverLocation='" + driverLocation + '\'' +
                ", driver='" + driver + '\'' +
                ", connectType='" + connectType + '\'' +
                ", dbType=" + dbType +
                '}';
    }
}
