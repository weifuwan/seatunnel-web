package org.apache.seatunnel.admin.thirdparty.transfrom.domain;

import lombok.Data;

@Data
public class SQLTransformOptions implements TransformOptions {

    private SQL sql;
}
