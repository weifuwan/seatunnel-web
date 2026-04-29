package org.apache.seatunnel.web.spi.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "客户端验证数据源请求")
public class ClientDatasourceVerifyDTO {

    @Schema(description = "数据源ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long datasourceId;

    @Schema(description = "超时时间，单位毫秒", example = "15000")
    private Long timeoutMs;

    @Schema(description = "轮询间隔，单位毫秒", example = "1000")
    private Long pollIntervalMs;
}