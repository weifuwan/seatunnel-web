package org.apache.seatunnel.web.engine.client.rest;

import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@SuppressWarnings({"rawtypes","unchecked"})
public class SeaTunnelEngineRestClient {

    @Resource
    private SeaTunnelRestClient seatunnelRestClient;

    public Map<String, Object> jobInfo(Long jobEngineId) {
        return seatunnelRestClient.jobInfo(jobEngineId);
    }
}