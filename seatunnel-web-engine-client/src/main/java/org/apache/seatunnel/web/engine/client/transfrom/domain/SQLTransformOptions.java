package org.apache.seatunnel.web.engine.client.transfrom.domain;

import lombok.Data;

@Data
public class SQLTransformOptions implements TransformOptions {

    private SQL sql;
}
