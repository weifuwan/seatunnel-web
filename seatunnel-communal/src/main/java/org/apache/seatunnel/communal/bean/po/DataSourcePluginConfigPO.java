
package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.communal.DbType;

@Data
@TableName("t_seatunnel_datasource_plugin_config")
@EqualsAndHashCode(callSuper = true)
public class DataSourcePluginConfigPO extends BasePO {

    /**
     * 插件类型
     */
    private DbType pluginType;

    /**
     * 数据库连接参数
     */
    private String configSchema;

}
