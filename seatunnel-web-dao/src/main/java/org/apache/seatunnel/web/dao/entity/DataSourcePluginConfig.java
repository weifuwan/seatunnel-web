
package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.spi.enums.DbType;

@Data
@TableName("t_seatunnel_datasource_plugin_config")
@EqualsAndHashCode(callSuper = true)
public class DataSourcePluginConfig extends BaseEntity {

    /**
     * 插件类型
     */
    private DbType pluginType;

    /**
     * 数据库连接参数
     */
    private String configSchema;

}
