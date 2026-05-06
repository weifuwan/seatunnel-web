package org.apache.seatunnel.web.spi.form;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.seatunnel.web.spi.enums.DbType;

import java.util.List;

/**
 * 插件配置响应
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PluginConfigResponse {
    private DbType pluginType;
    private List<FormFieldConfig> formFields;
    
    /**
     * 是否需要安装插件
     */
    private Boolean installRequired;
    
    /**
     * 安装提示信息
     */
    private String installHint;
}
