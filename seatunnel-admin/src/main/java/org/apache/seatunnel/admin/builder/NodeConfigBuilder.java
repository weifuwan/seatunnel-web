package org.apache.seatunnel.admin.builder;

import com.typesafe.config.Config;

/**
 * Builder interface for creating node configuration objects.
 *
 * @param <T> the type of the node configuration to be built
 */
public interface NodeConfigBuilder<T> {

    /**
     * Return the node type supported by this builder.
     *
     * @return the node type identifier
     */
    String nodeType();

    /**
     * Build a node configuration instance from the given HOCON config.
     *
     * @param data the configuration data of the node
     * @return the built node configuration object
     */
    T build(Config data);

    /**
     * Extract the connector name from the node configuration.
     * <p>
     * By default, the connector name is read from the {@code connectorType} field.
     *
     * @param data the configuration data of the node
     * @return the connector name
     */
    default String connectorName(Config data) {
        return data.getString("pluginName").contains("CDC") ? data.getString("pluginName") : data.getString("connectorType");
    }
}
