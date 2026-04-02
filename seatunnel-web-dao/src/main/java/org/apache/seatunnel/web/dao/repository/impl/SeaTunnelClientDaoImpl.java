package org.apache.seatunnel.web.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.NonNull;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.SeaTunnelClientHealthStatusEnum;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.mapper.SeaTunnelClientMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.SeaTunnelClientDao;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SeaTunnelClientDaoImpl
        extends BaseDao<SeaTunnelClient, SeaTunnelClientMapper>
        implements SeaTunnelClientDao {

    public SeaTunnelClientDaoImpl(@NonNull SeaTunnelClientMapper SeaTunnelClientMapper) {
        super(SeaTunnelClientMapper);
    }

    @Override
    public IPage<SeaTunnelClient> pageClients(SeaTunnelClientPageDTO dto) {
        int pageNo = dto.getPageNo() == null ? 1 : dto.getPageNo();
        int pageSize = dto.getPageSize() == null ? 10 : dto.getPageSize();

        LambdaQueryWrapper<SeaTunnelClient> wrapper = buildPageWrapper(dto);
        Page<SeaTunnelClient> page = new Page<>(pageNo, pageSize);
        return this.selectPage(page, wrapper);
    }

    @Override
    public List<SeaTunnelClient> listActiveClients() {
        LambdaQueryWrapper<SeaTunnelClient> wrapper = new LambdaQueryWrapper<>();
        return this.selectList(wrapper);
    }

    @Override
    public SeaTunnelClientStatisticsVO statistics() {
        List<SeaTunnelClient> list = listActiveClients();

        int total = list.size();
        int liveCount = 0;
        int downCount = 0;

        for (SeaTunnelClient item : list) {
            if (Integer.valueOf(SeaTunnelClientHealthStatusEnum.LIVE.getCode()).equals(item.getHealthStatus())) {
                liveCount++;
            } else {
                downCount++;
            }
        }

        SeaTunnelClientStatisticsVO vo = new SeaTunnelClientStatisticsVO();
        vo.setTotal(total);
        vo.setLiveCount(liveCount);
        vo.setDownCount(downCount);
        return vo;
    }

    private LambdaQueryWrapper<SeaTunnelClient> buildPageWrapper(SeaTunnelClientPageDTO dto) {
        LambdaQueryWrapper<SeaTunnelClient> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.isNotBlank(dto.getKeywords())) {
            wrapper.and(w -> w.like(SeaTunnelClient::getClientName, dto.getKeywords())
                    .or()
                    .like(SeaTunnelClient::getClientAddress, dto.getKeywords())
                    .or()
                    .like(SeaTunnelClient::getBaseUrl, dto.getKeywords()));
        }

        if (dto.getEngineTypes() != null && !dto.getEngineTypes().isEmpty()) {
            wrapper.in(SeaTunnelClient::getEngineType, dto.getEngineTypes());
        }

        if (dto.getHealthStatusList() != null && !dto.getHealthStatusList().isEmpty()) {
            wrapper.in(SeaTunnelClient::getHealthStatus, dto.getHealthStatusList());
        }

        String sortField = StringUtils.defaultIfBlank(dto.getSortField(), "createTime");
        boolean isAsc = "asc".equalsIgnoreCase(dto.getSortType());

        if ("heartbeatTime".equals(sortField)) {
            wrapper.orderBy(true, isAsc, SeaTunnelClient::getHeartbeatTime);
        } else if ("healthStatus".equals(sortField)) {
            wrapper.orderBy(true, isAsc, SeaTunnelClient::getHealthStatus);
        } else {
            wrapper.orderBy(true, isAsc, SeaTunnelClient::getCreateTime);
        }

        return wrapper;
    }
}