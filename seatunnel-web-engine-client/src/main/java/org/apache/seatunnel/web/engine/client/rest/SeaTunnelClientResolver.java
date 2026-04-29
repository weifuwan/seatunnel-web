package org.apache.seatunnel.web.engine.client.rest;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.repository.SeaTunnelClientDao;
import org.springframework.stereotype.Component;

@Component
public class SeaTunnelClientResolver {

    @Resource
    private SeaTunnelClientDao seatunnelClientDao;

    public String resolveBaseApiUrl(Long clientId) {
        SeaTunnelClient entity = seatunnelClientDao.queryById(clientId);
        return entity.getBaseUrl();
    }
}
