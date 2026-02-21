package org.apache.seatunnel.plugin.datasource.api.jdbc;

import org.apache.seatunnel.communal.config.OptionRule;

public interface SourceOptionRule {

    OptionRule sourceOptionRule();

    String pluginName();
}
