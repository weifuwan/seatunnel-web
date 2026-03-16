package org.apache.seatunnel.web.spi.bean.vo;


import lombok.Data;
import org.apache.seatunnel.web.common.enums.ConnStatus;
import org.apache.seatunnel.web.common.enums.EnvironmentEnum;
import org.apache.seatunnel.web.spi.enums.DbType;

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

}