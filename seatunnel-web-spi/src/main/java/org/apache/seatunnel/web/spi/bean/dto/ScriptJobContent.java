package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ScriptJobContent {

    /**
     * 比如 HOCON / SQL / DSL
     */
    private String scriptType;

    /**
     * 脚本文本
     */
    private String scriptText;

    /**
     * 额外参数
     */
    private Map<String, Object> params;
}
