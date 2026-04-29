package org.apache.seatunnel.web.dao.repository.impl;

import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.mapper.SeaTunnelClientMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.SeaTunnelClientDao;
import org.springframework.stereotype.Repository;

@Repository
public class SeaTunnelClientDaoImpl
        extends BaseDao<SeaTunnelClient, SeaTunnelClientMapper>
        implements SeaTunnelClientDao {

    @Resource
    private SeaTunnelClientMapper seaTunnelClientMapper;

    public SeaTunnelClientDaoImpl(@NonNull SeaTunnelClientMapper SeaTunnelClientMapper) {
        super(SeaTunnelClientMapper);
    }


    @Override
    public SeaTunnelClient selectById(Long clientId) {
        return seaTunnelClientMapper.selectById(clientId);
    }
}