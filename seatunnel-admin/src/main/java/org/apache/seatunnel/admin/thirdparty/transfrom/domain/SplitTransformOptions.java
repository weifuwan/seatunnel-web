package org.apache.seatunnel.admin.thirdparty.transfrom.domain;

import lombok.Data;

import java.util.List;

@Data
public class SplitTransformOptions implements TransformOptions {

    List<Split> splits;
}
