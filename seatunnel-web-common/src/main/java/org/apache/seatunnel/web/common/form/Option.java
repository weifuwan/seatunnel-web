package org.apache.seatunnel.web.common.form;

import lombok.Data;

/**
 * 选项配置（用于SELECT）
 */
@Data
public class Option {
    private String label;
    private Object value;
}
