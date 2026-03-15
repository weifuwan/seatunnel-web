package org.apache.seatunnel.web.api.controller;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.DatasourcePluginService;
import org.apache.seatunnel.web.common.bean.entity.Result;
import org.apache.seatunnel.web.common.form.PluginConfigResponse;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/v1/data-source/plugin/config")
public class DataSourcePluginConfigController {

    @Resource
    private DatasourcePluginService datasourcePluginService;

    /**
     * Get the configuration form for a specific data source plugin.
     *
     * @param pluginType Type of the plugin
     * @return Plugin configuration form
     */
    @GetMapping
    public Result<PluginConfigResponse> getPluginConfig(@RequestParam("pluginType") String pluginType) {
        if (pluginType == null || pluginType.trim().isEmpty()) {
            throw new RuntimeException("Plugin type cannot be empty");
        }

        try {
            PluginConfigResponse config = datasourcePluginService.getPluginConfig(pluginType);
            return Result.buildSuc(config);
        } catch (Exception e) {
            log.error("Failed to fetch plugin config for type {}: {}", pluginType, e.getMessage(), e);
            return Result.buildFailure(e.getMessage());
        }
    }

    @PostMapping("/install")
    public Result<Boolean> installPlugin(@RequestParam("pluginType") String pluginType) {
        if (pluginType == null || pluginType.trim().isEmpty()) {
            return Result.buildFailure("Plugin type cannot be empty");
        }

        try {
            datasourcePluginService.installPlugin(pluginType);
            return Result.buildSuc(true);
        } catch (Exception e) {
            log.error("Failed to install plugin for type {}: {}", pluginType, e.getMessage(), e);
            return Result.buildFailure(e.getMessage());
        }
    }
}
