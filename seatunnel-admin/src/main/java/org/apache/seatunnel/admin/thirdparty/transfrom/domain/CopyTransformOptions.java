package org.apache.seatunnel.admin.thirdparty.transfrom.domain;

import lombok.Data;

import java.util.List;

@Data
public class CopyTransformOptions implements TransformOptions {

    private List<Copy> copyList;
}
