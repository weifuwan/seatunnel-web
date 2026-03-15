package org.apache.seatunnel.web.api.thirdparty.transfrom.domain;

import lombok.Data;

import java.util.List;

@Data
public class FieldMapperTransformOptions implements TransformOptions {

    private String nodeType;
    private String type;
    private String title;
    private String transformType;
    private boolean filedsChanged;
    private String pluginInput;
    private String pluginOutput;

    private List<FieldMapperField> transformColumns;
}
