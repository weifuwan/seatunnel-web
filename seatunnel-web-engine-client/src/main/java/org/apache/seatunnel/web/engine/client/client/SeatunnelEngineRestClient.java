package org.apache.seatunnel.web.engine.client.client;

import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@SuppressWarnings({"rawtypes","unchecked"})
public class SeatunnelEngineRestClient {

    @Resource
    private SeatunnelRestClient seatunnelRestClient;

    public Map<String, Object> jobInfo(Long jobEngineId) {
        return seatunnelRestClient.jobInfo(jobEngineId);
    }
}