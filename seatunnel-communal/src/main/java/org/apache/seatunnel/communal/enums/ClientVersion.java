package org.apache.seatunnel.communal.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;

/**
 * Client version
 */
public enum ClientVersion {
    V_2_3_12("V_2_3_12", "2.3.12");

    private final String version;

    @EnumValue
    private final String name;

    ClientVersion(final String version, final String name) {
        this.version = version;
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public String getName() {
        return name;
    }
}
