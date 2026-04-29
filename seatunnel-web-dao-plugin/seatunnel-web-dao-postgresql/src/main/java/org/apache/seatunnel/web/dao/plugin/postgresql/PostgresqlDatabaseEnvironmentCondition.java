package org.apache.seatunnel.web.dao.plugin.postgresql;


import org.apache.seatunnel.web.dao.plugin.api.DatabaseEnvironmentCondition;

public class PostgresqlDatabaseEnvironmentCondition extends DatabaseEnvironmentCondition {

    public PostgresqlDatabaseEnvironmentCondition() {
        super("postgresql");
    }

}
