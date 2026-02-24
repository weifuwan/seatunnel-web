
package org.apache.seatunnel.communal.bean.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.enums.ConnStatus;
import org.apache.seatunnel.communal.enums.EnvironmentEnum;

import java.util.Date;

@Data
public class DataSourceVO {

    /**
     * 主键
     */
    private Long id;

    /**
     * 数据源名称
     */
    private String dbName;

    /**
     * 数据源类型
     */
    private DbType dbType;

    /**
     * 环境
     */
    private EnvironmentEnum environment;

    /**
     * 环境中文名称
     */
    private String environmentName;

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
     * 数据库连接
     */
    private String jdbcUrl;

    /**
     * 连接状态
     */
    private ConnStatus connStatus;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    /**
     * 创建人
     */
    private String createBy;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;

    /**
     * 更新人
     */
    private String updateBy;
}
