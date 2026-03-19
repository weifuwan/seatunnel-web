package org.apache.seatunnel.web.dao.plugin.h2;


import org.apache.seatunnel.web.dao.plugin.api.DatabaseEnvironmentCondition;

public class H2DatabaseEnvironmentCondition extends DatabaseEnvironmentCondition {

    public H2DatabaseEnvironmentCondition() {
        super("h2");
    }

}
