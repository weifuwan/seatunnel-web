package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ScriptJobContent {

    /**
     * 比如 HOCON
     */
    private String scriptType;

    /**
     * 脚本文本
     */
    private String hoconContent;

}
