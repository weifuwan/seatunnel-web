package org.apache.seatunnel.communal.bean.entity;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Engine {
    private EngineType name;
    private String version;
}
