package org.apache.seatunnel.web.spi.bean.vo;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.apache.seatunnel.web.common.enums.ConnStatus;
import org.apache.seatunnel.web.common.enums.EnvironmentEnum;
import org.apache.seatunnel.web.spi.enums.DbType;

import java.util.Date;

@Data
public class DataSourceVO {

    private Long id;

    private String name;

    private DbType dbType;

    private String jdbcUrl;

    private String remark;

    private String connectionParams;

    private String originalJson;

    private ConnStatus connStatus;

    private EnvironmentEnum environment;

    private String environmentName;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;

    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;

}