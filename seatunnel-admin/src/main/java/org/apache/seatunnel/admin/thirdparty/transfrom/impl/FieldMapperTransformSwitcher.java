package org.apache.seatunnel.admin.thirdparty.transfrom.impl;

import com.google.auto.service.AutoService;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.thirdparty.transfrom.TransformConfigSwitcher;
import org.apache.seatunnel.admin.thirdparty.transfrom.domain.FieldMapperField;
import org.apache.seatunnel.admin.thirdparty.transfrom.domain.FieldMapperTransformOptions;
import org.apache.seatunnel.admin.thirdparty.transfrom.domain.Transform;
import org.apache.seatunnel.admin.thirdparty.transfrom.domain.TransformOptions;

import java.util.HashMap;
import java.util.Map;

/**
 * TransformConfigSwitcher implementation for SeaTunnel FieldMapper transform.
 *
 * <p>
 * Responsible for converting {@link FieldMapperTransformOptions}
 * into a SeaTunnel-compatible {@link Config}.
 * </p>
 */
@Slf4j
@AutoService(TransformConfigSwitcher.class)
public class FieldMapperTransformSwitcher implements TransformConfigSwitcher {

    @Override
    public Transform getTransform() {
        return Transform.FIELDMAPPER;
    }

    @Override
    public Config transform(TransformOptions options) {
        if (!(options instanceof FieldMapperTransformOptions)) {
            throw new IllegalArgumentException(
                    "Invalid TransformOptions type for FieldMapper: "
                            + options.getClass().getName());
        }

        FieldMapperTransformOptions transformOptions =
                (FieldMapperTransformOptions) options;

        validate(transformOptions);

        log.info(
                "Generating FieldMapper config, plugin_input={}, plugin_output={}, field_count={}",
                transformOptions.getPluginInput(),
                transformOptions.getPluginOutput(),
                transformOptions.getTransformColumns().size()
        );

        Map<String, Object> fieldMapper = new HashMap<>();

        for (FieldMapperField field : transformOptions.getTransformColumns()) {
            fieldMapper.put(field.getFieldName(), field.getTargetFieldName());
        }

        Map<String, Object> fieldMapperConfig = new HashMap<>();
        fieldMapperConfig.put("plugin_input", transformOptions.getPluginInput());
        fieldMapperConfig.put("plugin_output", transformOptions.getPluginOutput());
        fieldMapperConfig.put("field_mapper", fieldMapper);

        Map<String, Object> root = new HashMap<>();
        root.put("FieldMapper", fieldMapperConfig);

        Config config = ConfigFactory.parseMap(root);

        log.debug("Generated FieldMapper config: {}", config.root().render());

        return config;
    }

    /**
     * Validate FieldMapper transform options.
     *
     * @param options FieldMapperTransformOptions
     */
    private void validate(FieldMapperTransformOptions options) {
        if (StringUtils.isBlank(options.getPluginInput())) {
            throw new IllegalArgumentException("plugin_input must not be empty");
        }

        if (StringUtils.isBlank(options.getPluginOutput())) {
            throw new IllegalArgumentException("plugin_output must not be empty");
        }

        if (CollectionUtils.isEmpty(options.getTransformColumns())) {
            throw new IllegalArgumentException("transformColumns must not be empty");
        }

        for (FieldMapperField field : options.getTransformColumns()) {
            if (StringUtils.isBlank(field.getFieldName())) {
                throw new IllegalArgumentException("source field name must not be empty");
            }
            if (StringUtils.isBlank(field.getTargetFieldName())) {
                throw new IllegalArgumentException(
                        "target field name must not be empty for source field: "
                                + field.getFieldName());
            }
        }
    }
}
