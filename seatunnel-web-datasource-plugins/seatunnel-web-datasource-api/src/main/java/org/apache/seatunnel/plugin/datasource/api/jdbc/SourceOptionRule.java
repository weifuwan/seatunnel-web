package org.apache.seatunnel.plugin.datasource.api.jdbc;

import org.apache.seatunnel.web.common.config.OptionRule;

public interface SourceOptionRule {

    OptionRule sourceOptionRule();

    String pluginName();
}
