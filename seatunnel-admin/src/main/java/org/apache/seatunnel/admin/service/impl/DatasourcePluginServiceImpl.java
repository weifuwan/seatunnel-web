package org.apache.seatunnel.admin.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.dao.DatasourcePluginConfigMapper;
import org.apache.seatunnel.admin.service.DatasourcePluginService;
import org.apache.seatunnel.communal.bean.po.DataSourcePluginConfigPO;
import org.apache.seatunnel.communal.form.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DatasourcePluginServiceImpl
        extends ServiceImpl<DatasourcePluginConfigMapper, DataSourcePluginConfigPO>
        implements DatasourcePluginService {

    @Override
    public PluginConfigResponse getPluginConfig(String pluginType) {
        if (StringUtils.isBlank(pluginType)) {
            throw new IllegalArgumentException("Plugin type must not be empty");
        }

        LambdaQueryWrapper<DataSourcePluginConfigPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataSourcePluginConfigPO::getPluginType, pluginType);

        DataSourcePluginConfigPO config = this.getOne(wrapper);
        if (config == null) {
            throw new RuntimeException("Plugin configuration not found: " + pluginType);
        }

        JSONObject schema = JSONObject.parseObject(config.getConfigSchema());
        List<FormFieldConfig> formFields = parseConfigSchema(schema);

        PluginConfigResponse response = new PluginConfigResponse();
        response.setPluginType(config.getPluginType());
        response.setFormFields(formFields);
        return response;
    }

    /**
     * Parse JSON schema to form field configurations.
     */
    private List<FormFieldConfig> parseConfigSchema(JSONObject schema) {
        if (schema == null) {
            throw new IllegalArgumentException("Config schema must not be null");
        }

        JSONArray fields = schema.getJSONArray("fields");
        if (fields == null || fields.isEmpty()) {
            return new ArrayList<>();
        }

        List<FormFieldConfig> formFields = new ArrayList<>(fields.size());
        for (int i = 0; i < fields.size(); i++) {
            JSONObject fieldJson = fields.getJSONObject(i);
            formFields.add(parseField(fieldJson));
        }
        return formFields;
    }

    /**
     * Parse a single field definition.
     */
    private FormFieldConfig parseField(JSONObject fieldJson) {
        FormFieldConfig field = new FormFieldConfig();

        field.setKey(fieldJson.getString("key"));
        field.setLabel(fieldJson.getString("label"));
        field.setType(parseFieldType(fieldJson));
        field.setPlaceholder(fieldJson.getString("placeholder"));
        field.setDefaultValue(fieldJson.get("defaultValue"));

        if (FieldType.SELECT.equals(field.getType())) {
            field.setOptions(parseOptions(fieldJson.getJSONArray("options")));
        }

        field.setRules(parseRules(fieldJson.getJSONArray("rules")));
        return field;
    }

    /**
     * Parse field type safely.
     */
    private FieldType parseFieldType(JSONObject fieldJson) {
        String type = fieldJson.getString("type");
        if (StringUtils.isBlank(type)) {
            throw new IllegalArgumentException("Field type must not be empty");
        }
        return FieldType.valueOf(type.toUpperCase());
    }

    /**
     * Parse select options.
     */
    private List<Option> parseOptions(JSONArray optionsJson) {
        if (optionsJson == null || optionsJson.isEmpty()) {
            return new ArrayList<>();
        }

        List<Option> options = new ArrayList<>(optionsJson.size());
        for (int i = 0; i < optionsJson.size(); i++) {
            JSONObject opt = optionsJson.getJSONObject(i);
            Option option = new Option();
            option.setLabel(opt.getString("label"));
            option.setValue(opt.get("value"));
            options.add(option);
        }
        return options;
    }

    /**
     * Parse validation rules.
     */
    private List<Rule> parseRules(JSONArray rulesJson) {
        if (rulesJson == null || rulesJson.isEmpty()) {
            return new ArrayList<>();
        }

        List<Rule> rules = new ArrayList<>(rulesJson.size());
        for (int i = 0; i < rulesJson.size(); i++) {
            JSONObject ruleJson = rulesJson.getJSONObject(i);
            Rule rule = new Rule();
            rule.setPattern(ruleJson.getString("pattern"));
            rule.setMessage(ruleJson.getString("message"));
            rule.setMin(ruleJson.getInteger("min"));
            rule.setMax(ruleJson.getInteger("max"));
            rule.setRequired(ruleJson.getBoolean("required"));
            rules.add(rule);
        }
        return rules;
    }
}
