package org.apache.seatunnel.web.spi.bean.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

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

    /**
     * 分项校验结果。
     *
     * CDC 场景下很有用：
     * - 基础连通性
     * - binlog 是否开启
     * - binlog_format 是否为 ROW
     * - binlog_row_image 是否为 FULL
     * - server_id 是否有效
     * - 权限是否满足
     */
    private List<ClientDatasourceVerifyItemVO> items;

    public static ClientDatasourceVerifyVO success(String message) {
        ClientDatasourceVerifyVO vo = new ClientDatasourceVerifyVO();
        vo.setSuccess(true);
        vo.setMessage(message);
        vo.setItems(new ArrayList<>());
        return vo;
    }

    public static ClientDatasourceVerifyVO fail(String message) {
        ClientDatasourceVerifyVO vo = new ClientDatasourceVerifyVO();
        vo.setSuccess(false);
        vo.setMessage(message);
        vo.setErrorMessage(message);
        vo.setItems(new ArrayList<>());
        return vo;
    }

    public void addItem(ClientDatasourceVerifyItemVO item) {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        this.items.add(item);
    }
}