package org.apache.seatunnel.communal.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;


@AllArgsConstructor
@Getter
public enum ConnStatus {
    CONNECTED_SUCCESS("CONNECTED_SUCCESS", "已连接"),
    CONNECTED_FAILED("CONNECTED_FAILED", "连接失败"),
    CONNECTING("CONNECTING", "连接中"),
    CONNECTED_NONE("CONNECTED_NONE", "未连接");

    @EnumValue
    private final String code;
    private final String description;

}
