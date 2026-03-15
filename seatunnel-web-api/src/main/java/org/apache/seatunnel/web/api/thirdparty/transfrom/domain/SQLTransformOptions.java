package org.apache.seatunnel.web.api.thirdparty.transfrom.domain;

import lombok.Data;

@Data
public class SQLTransformOptions implements TransformOptions {

    private SQL sql;
}
