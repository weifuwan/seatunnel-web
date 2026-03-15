package org.apache.seatunnel.web.common.bean.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Engine {
    private EngineType name;
    private String version;
}
