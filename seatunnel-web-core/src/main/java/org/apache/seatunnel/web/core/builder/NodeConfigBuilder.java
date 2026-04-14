package org.apache.seatunnel.web.core.builder;

import com.typesafe.config.Config;
import org.apache.commons.lang3.StringUtils;

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
     * Prefer {@code pluginName}; if absent, fallback to {@code connectorType}.
     *
     * @param data the configuration data of the node
     * @return the connector name
     */
    default String connectorName(Config data) {
        Config config = resolveNodeConfig(data);

        if (config.hasPath("pluginName")) {
            String pluginName = config.getString("pluginName");
            if (StringUtils.isNotBlank(pluginName)) {
                return pluginName;
            }
        }

        if (config.hasPath("connectorType")) {
            String connectorType = config.getString("connectorType");
            if (StringUtils.isNotBlank(connectorType)) {
                return connectorType;
            }
        }

        throw new RuntimeException("pluginName or connectorType is missing");
    }

    default Config resolveNodeConfig(Config data) {
        if (data == null) {
            throw new RuntimeException("node data is null");
        }
        return data.hasPath("config") ? data.getConfig("config") : data;
    }
}
