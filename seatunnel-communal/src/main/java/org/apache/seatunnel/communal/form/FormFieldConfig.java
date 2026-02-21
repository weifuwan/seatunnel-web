package org.apache.seatunnel.communal.form;

import lombok.Data;

import java.util.List;

/**
 * 表单字段配置
 */
@Data
public class FormFieldConfig {
    private String key;
    private String label;
    private FieldType type;
    private String placeholder;
    private Object defaultValue;
    private List<Option> options; // 用于SELECT类型
    private List<Rule> rules; // 验证规则

}
