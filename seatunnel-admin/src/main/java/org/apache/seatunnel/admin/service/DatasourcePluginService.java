package org.apache.seatunnel.admin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.communal.bean.po.DataSourcePluginConfigPO;
import org.apache.seatunnel.communal.form.PluginConfigResponse;


public interface DatasourcePluginService extends IService<DataSourcePluginConfigPO> {

    /**
     * Retrieves the dynamic form configuration for the requested plugin.
     * <p>
     * The returned schema describes every field (type, default, validation rules,
     * visibility conditions, etc.) that the UI must render so that users can
     * create or edit a data-source of this plugin type.
     * </p>
     *
     * @param pluginName unique identifier of the plugin (e.g. {@code MySQL}, {@code Kafka})
     * @return complete form descriptor, never {@code null}
     * @throws RuntimeException if the plugin is unknown or its configuration cannot be loaded
     */
    PluginConfigResponse getPluginConfig(String pluginName);
}