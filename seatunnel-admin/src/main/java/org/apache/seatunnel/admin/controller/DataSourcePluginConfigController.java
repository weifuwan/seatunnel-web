package org.apache.seatunnel.admin.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.DatasourcePluginService;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.form.PluginConfigResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@Slf4j
@RestController
@RequestMapping("/api/v1/data-source/plugin/config")
@Api(tags = "Data Integration - Data Source Plugin Configuration")
public class DataSourcePluginConfigController {

    @Resource
    private DatasourcePluginService datasourcePluginService;

    /**
     * Get the configuration form for a specific data source plugin.
     *
     * @param pluginType Type of the plugin
     * @return Plugin configuration form
     */
    @ApiOperation(value = "Get data source plugin configuration")
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
            throw new RuntimeException("Failed to fetch plugin configuration");
        }
    }
}
