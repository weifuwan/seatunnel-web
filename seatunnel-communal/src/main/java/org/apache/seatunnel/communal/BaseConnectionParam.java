package org.apache.seatunnel.communal;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Data;

@Data
@JsonInclude(Include.NON_NULL)
public abstract class BaseConnectionParam implements ConnectionParam {

    protected String user;

    protected String password;

    private String host;

    private String port;

    protected String url;

    protected String driverLocation;

    protected String driver;

    protected DbType dbType;

    protected String database;

    protected String schemaName;

}
