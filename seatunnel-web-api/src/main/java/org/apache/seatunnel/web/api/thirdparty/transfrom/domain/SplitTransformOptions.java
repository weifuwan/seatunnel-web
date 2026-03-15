package org.apache.seatunnel.web.api.thirdparty.transfrom.domain;

import lombok.Data;

import java.util.List;

@Data
public class SplitTransformOptions implements TransformOptions {

    List<Split> splits;
}
