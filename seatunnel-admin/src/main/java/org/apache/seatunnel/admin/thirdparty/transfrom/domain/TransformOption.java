package org.apache.seatunnel.admin.thirdparty.transfrom.domain;

import lombok.Data;

@Data
public abstract class TransformOption {

    private String fieldName;
    private String fieldType;
}
