
package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.enums.ConnStatus;
import org.apache.seatunnel.communal.enums.EnvironmentEnum;


@Data
@TableName("t_seatunnel_datasource")
@EqualsAndHashCode(callSuper = true)
public class DataSourcePO extends BasePO {

    /**
     * 数据源名称
     */
    private String dbName;

    /**
     * 数据源类型
     */
    private DbType dbType;

    /**
     * 数据库连接参数
     */
    private String connectionParams;

    /**
     * 原始json
     */
    private String originalJson;

    /**
     * 描述
     */
    private String remark;

    /**
     * 连接状态
     */
    private ConnStatus connStatus;

    /**
     * 环境
     */
    private EnvironmentEnum environment;
}
