package org.apache.seatunnel.communal.form;

import lombok.Data;
import org.apache.seatunnel.communal.DbType;

import java.util.List;

/**
 * 插件配置响应
 */
@Data
public class PluginConfigResponse {
    private DbType pluginType;
    private List<FormFieldConfig> formFields;
}
