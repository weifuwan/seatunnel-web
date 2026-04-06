package org.apache.seatunnel.web.spi.bean.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "客户端验证数据源结果")
public class ClientDatasourceVerifyVO {

    @Schema(description = "是否成功")
    private Boolean success;

    @Schema(description = "结果摘要")
    private String message;

    @Schema(description = "客户端ID")
    private Long clientId;

    @Schema(description = "客户端名称")
    private String clientName;

    @Schema(description = "客户端地址")
    private String clientBaseUrl;

    @Schema(description = "数据源ID")
    private Long datasourceId;

    @Schema(description = "数据源名称")
    private String datasourceName;

    @Schema(description = "数据源类型")
    private String datasourceType;

    @Schema(description = "测试任务名称")
    private String testJobName;

    @Schema(description = "测试任务ID")
    private String testJobId;

    @Schema(description = "最终任务状态")
    private String finalJobStatus;

    @Schema(description = "失败原因")
    private String errorMessage;

    @Schema(description = "耗时，毫秒")
    private Long durationMs;
}