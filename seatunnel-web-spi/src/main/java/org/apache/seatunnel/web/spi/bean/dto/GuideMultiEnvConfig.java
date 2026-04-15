package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;

@Data
public class GuideMultiEnvConfig {

    private String jobMode;

    private Integer parallelism;
}