package org.apache.seatunnel.admin.thirdparty.transfrom.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SQL extends TransformOption {

    private String query;
}
