
package org.apache.seatunnel.web.spi.enums;

import lombok.Getter;

@Getter
public enum DbConnectType {

    ORACLE_SERVICE_NAME(0, "Oracle Service Name"),
    ORACLE_SID(1, "Oracle SID");

    DbConnectType(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    private final int code;

    private final String desc;

}
