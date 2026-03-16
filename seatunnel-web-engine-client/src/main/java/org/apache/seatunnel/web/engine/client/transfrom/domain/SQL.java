package org.apache.seatunnel.web.engine.client.transfrom.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SQL extends TransformOption {

    private String query;
}
