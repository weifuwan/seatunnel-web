package org.apache.seatunnel.plugin.datasource.api.form;

import org.apache.seatunnel.web.common.KeyValuePair;
import org.apache.seatunnel.web.common.form.FormField;
import org.apache.seatunnel.web.common.form.FormFieldConfig;
import org.apache.seatunnel.web.common.form.Rule;

import java.lang.reflect.Field;
import java.util.*;

/**
 * Reflection-based generator that converts a parameter class annotated with
 * {@link FormField} into a list of {@link FormFieldConfig}.
 *
 * <p>This utility is mainly used by datasource plugins to dynamically generate
 * frontend form configuration based on backend parameter definitions.</p>
 *
 * <p>Key features:</p>
 * <ul>
 *     <li>Supports inheritance: fields in parent classes will also be scanned</li>
 *     <li>Prevents duplicated fields by using a LinkedHashMap</li>
 *     <li>Automatically builds validation rules for required fields</li>
 *     <li>Supports parsing default values for List types</li>
 *     <li>Sorts the final form fields according to the configured order</li>
 * </ul>
 */
public class ReflectionFormGenerator {

    /**
     * Generate form configuration from a parameter class.
     *
     * @param paramClass The parameter class containing {@link FormField} annotations
     * @return List of {@link FormFieldConfig} describing the frontend form structure
     */
    public static List<FormFieldConfig> generate(Class<?> paramClass) {

        List<FormFieldConfig> fields = new ArrayList<>();

        /*
         * Use LinkedHashMap to:
         * 1. Preserve field declaration order
         * 2. Avoid duplicated fields when scanning parent classes
         */
        Map<String, Field> fieldMap = new LinkedHashMap<>();

        Class<?> current = paramClass;

        /*
         * Traverse the class hierarchy to collect all declared fields,
         * including fields defined in parent classes.
         */
        while (current != null && current != Object.class) {

            for (Field field : current.getDeclaredFields()) {

                // Avoid overriding child-class fields with parent-class fields
                fieldMap.putIfAbsent(field.getName(), field);
            }

            current = current.getSuperclass();
        }

        /*
         * Convert each annotated field into a FormFieldConfig object.
         */
        for (Field field : fieldMap.values()) {

            FormField formField = field.getAnnotation(FormField.class);

            // Skip fields without FormField annotation
            if (formField == null) {
                continue;
            }

            FormFieldConfig config = new FormFieldConfig();

            // Basic field metadata
            config.setKey(field.getName());
            config.setLabel(formField.label());
            config.setPlaceholder(formField.placeholder());
            config.setType(formField.type());

            /*
             * Generate validation rules if the field is marked as required.
             */
            if (formField.required()) {
                Rule rule = new Rule();
                rule.setRequired(true);
                rule.setMessage(formField.label() + " cannot be empty");
                config.setRules(List.of(rule));
            }

            /*
             * Parse default values.
             *
             * Special handling is required for List fields because
             * the default value is stored as JSON.
             */
            String defaultValue = formField.defaultValue();
            if (!defaultValue.isEmpty()) {

                if (field.getType() == List.class) {
                    config.setDefaultValue(
                            JSON.parseArray(defaultValue, KeyValuePair.class)
                    );
                } else {
                    config.setDefaultValue(defaultValue);
                }
            }

            // Used by frontend to control field display order
            config.setOrder(formField.order());

            fields.add(config);
        }

        /**
         * Sort fields according to the configured order.
         */
        fields.sort(Comparator.comparing(FormFieldConfig::getOrder));

        return fields;
    }
}