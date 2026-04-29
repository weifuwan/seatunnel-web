package org.apache.seatunnel.web.dao.plugin.mysql;


import org.apache.seatunnel.web.dao.plugin.api.DatabaseEnvironmentCondition;

public class MysqlDatabaseEnvironmentCondition extends DatabaseEnvironmentCondition {

    public MysqlDatabaseEnvironmentCondition() {
        super("mysql");
    }

}
