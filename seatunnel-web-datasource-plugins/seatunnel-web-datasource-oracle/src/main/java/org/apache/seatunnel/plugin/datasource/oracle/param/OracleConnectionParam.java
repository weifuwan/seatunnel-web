package org.apache.seatunnel.plugin.datasource.oracle.param;


import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.enums.DbConnectType;
import org.apache.seatunnel.web.spi.form.FieldType;
import org.apache.seatunnel.web.spi.form.FormField;

@Data
@EqualsAndHashCode(callSuper = true)
public class OracleConnectionParam extends BaseConnectionParam {

    protected DbConnectType connectType;

    @FormField(label = "端口号", required = true, order = 2, defaultValue = "1521", type = FieldType.NUMBER)
    protected String port;

    @FormField(
            label = "驱动Jar包",
            order = 6,
            defaultValue = "ojdbc8-19.3.0.0.jar"
    )
    protected String driverLocation;


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
