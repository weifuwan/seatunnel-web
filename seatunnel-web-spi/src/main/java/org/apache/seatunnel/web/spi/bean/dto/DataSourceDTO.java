package org.apache.seatunnel.web.spi.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.web.common.enums.ConnStatus;
import org.apache.seatunnel.web.common.enums.EnvironmentEnum;
import org.apache.seatunnel.web.spi.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.web.spi.enums.DbType;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Data source DTO for creating and updating data sources")
public class DataSourceDTO extends PaginationBaseDTO {

    private Long id;

    private String name;

    private DbType dbType;

    private EnvironmentEnum environment;

    private String originalJson;

    private String connectionParams;

    private String remark;

    private ConnStatus connStatus;
}