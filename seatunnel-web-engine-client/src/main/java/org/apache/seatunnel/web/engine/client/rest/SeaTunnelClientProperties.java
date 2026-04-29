package org.apache.seatunnel.web.engine.client.rest;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "seatunnel.client")
public class SeaTunnelClientProperties {


    private int connectTimeoutMs = 2000;
    private int readTimeoutMs = 10000;

}
