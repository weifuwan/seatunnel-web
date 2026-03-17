package org.apache.seatunnel.web.common.enums;

public enum SeaTunnelClientHealthStatusEnum {
    LIVE(1, "运行中"),
    DOWN(2, "离线");

    private final int code;
    private final String desc;

    SeaTunnelClientHealthStatusEnum(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }
}