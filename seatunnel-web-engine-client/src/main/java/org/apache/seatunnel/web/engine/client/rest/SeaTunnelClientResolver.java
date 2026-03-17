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
        if (entity == null || Integer.valueOf(1).equals(entity.getIsDeleted())) {
            throw new IllegalArgumentException("客户端不存在");
        }
        return entity.buildBaseApiUrl();
    }
}
