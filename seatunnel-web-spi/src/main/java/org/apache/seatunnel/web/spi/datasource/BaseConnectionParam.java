package org.apache.seatunnel.web.spi.datasource;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Data;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.apache.seatunnel.web.spi.form.FieldType;
import org.apache.seatunnel.web.spi.form.FormField;

@Data
@JsonInclude(Include.NON_NULL)
public abstract class BaseConnectionParam implements ConnectionParam {

    protected String url;

    @FormField(label = "主机地址IP", required = true, placeholder = "localhost", order = 1, defaultValue = "localhost")
    private String host;

    @FormField(label = "端口号", required = true, placeholder = "3306", type = FieldType.NUMBER, order = 2)
    private String port;

    @FormField(label = "数据库", required = true, order = 3, defaultValue = "")
    protected String database;

    @FormField(label = "用户名", required = true, order = 4)
    protected String user;

    @FormField(label = "密码", required = true, type = FieldType.PASSWORD, order = 5)
    protected String password;

    @FormField(label = "驱动Jar包", order = 6)
    protected String driverLocation;

    protected String driver;

    protected DbType dbType;

    @FormField(label = "Schema", order = 7)
    protected String schemaName;

}
