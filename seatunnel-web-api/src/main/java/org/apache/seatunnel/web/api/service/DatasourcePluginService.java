package org.apache.seatunnel.web.api.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.web.common.bean.po.DataSourcePluginConfigPO;
import org.apache.seatunnel.web.common.form.PluginConfigResponse;

/**
 * Service responsible for managing datasource plugin configurations.
 *
 * <p>This service provides functionality to:</p>
 * <ul>
 *     <li>Retrieve dynamic form configuration for datasource plugins</li>
 *     <li>Install datasource plugins at runtime</li>
 *     <li>Persist plugin configuration metadata</li>
 * </ul>
 *
 * <p>The dynamic form configuration returned by this service is consumed
 * by the frontend to render plugin-specific configuration forms.</p>
 */
public interface DatasourcePluginService extends IService<DataSourcePluginConfigPO> {

    /**
     * Retrieves the dynamic form configuration for the requested plugin.
     *
     * <p>The returned schema describes every field required by the plugin,
     * including its type, default value, validation rules, and other UI
     * metadata needed to render a configuration form dynamically.</p>
     *
     * <p>This mechanism allows the UI to generate plugin configuration
     * forms without hardcoding plugin-specific logic.</p>
     *
     * @param pluginName unique identifier of the plugin
     *                   (e.g. {@code MySQL}, {@code Kafka})
     * @return complete form descriptor used by the UI to render
     *         the plugin configuration form, never {@code null}
     * @throws RuntimeException if the plugin is unknown or its
     *                          configuration cannot be loaded
     */
    PluginConfigResponse getPluginConfig(String pluginName);

    /**
     * Installs the specified datasource plugin.
     *
     * <p>This method downloads or loads the plugin artifacts,
     * registers the plugin configuration, and makes it available
     * for use within the system.</p>
     *
     * <p>If the plugin is already installed, the implementation
     * may choose to skip installation or perform an update.</p>
     *
     * @param pluginType unique identifier of the plugin
     *                   (e.g. {@code mysql}, {@code kafka})
     */
    void installPlugin(String pluginType);
}