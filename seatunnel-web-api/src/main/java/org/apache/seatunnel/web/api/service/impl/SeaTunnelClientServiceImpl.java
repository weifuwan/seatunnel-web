package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.SeaTunnelClientService;
import org.apache.seatunnel.web.common.enums.SeaTunnelClientHealthStatusEnum;
import org.apache.seatunnel.web.common.enums.SeaTunnelClientStatusEnum;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.repository.SeaTunnelClientDao;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientLogVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class SeaTunnelClientServiceImpl implements SeaTunnelClientService {

    @Resource
    private SeaTunnelClientDao SeaTunnelClientDao;

    @Resource
    private RestTemplate restTemplate;

    @Override
    public void saveOrUpdate(SeaTunnelClientDTO dto) {
        validate(dto);

        Date now = new Date();
        if (dto.getId() == null) {
            SeaTunnelClient entity = new SeaTunnelClient();
            BeanUtils.copyProperties(dto, entity);
            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.DOWN.getCode());
            entity.setClientStatus(
                    dto.getClientStatus() == null
                            ? SeaTunnelClientStatusEnum.ENABLED.getCode()
                            : dto.getClientStatus()
            );
            entity.setCreateTime(now);
            entity.setUpdateTime(now);
            entity.setIsDeleted(0);
            SeaTunnelClientDao.insert(entity);
            return;
        }

        SeaTunnelClient entity = getEntity(dto.getId());
        BeanUtils.copyProperties(dto, entity);
        entity.setUpdateTime(now);
        SeaTunnelClientDao.updateById(entity);
    }

    @Override
    public SeaTunnelClientVO selectById(Long id) {
        SeaTunnelClient entity = getEntity(id);
        return toVO(entity);
    }

    @Override
    public void delete(Long id) {
        SeaTunnelClient entity = getEntity(id);
        entity.setIsDeleted(1);
        entity.setUpdateTime(new Date());
        SeaTunnelClientDao.updateById(entity);
    }

    @Override
    public IPage<SeaTunnelClientVO> page(SeaTunnelClientPageDTO dto) {
        IPage<SeaTunnelClient> entityPage = SeaTunnelClientDao.pageClients(dto);

        Page<SeaTunnelClientVO> result = new Page<>();
        BeanUtils.copyProperties(entityPage, result, "records");

        List<SeaTunnelClientVO> voList = new ArrayList<>();
        for (SeaTunnelClient entity : entityPage.getRecords()) {
            voList.add(toVO(entity));
        }
        result.setRecords(voList);
        return result;
    }

    @Override
    public SeaTunnelClientStatisticsVO statistics() {
        return SeaTunnelClientDao.statistics();
    }

    @Override
    public void enable(Long id) {
        updateClientStatus(id, SeaTunnelClientStatusEnum.ENABLED.getCode());
    }

    @Override
    public void disable(Long id) {
        updateClientStatus(id, SeaTunnelClientStatusEnum.DISABLED.getCode());
    }

    @Override
    public boolean testConnection(Long id) {
        SeaTunnelClient entity = getEntity(id);
        String url = entity.buildBaseApiUrl() + "/health";

        try {
            String result = restTemplate.getForObject(url, String.class);
            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.LIVE.getCode());
            entity.setHeartbeatTime(new Date());
            entity.setUpdateTime(new Date());
            SeaTunnelClientDao.updateById(entity);
            return result != null;
        } catch (Exception e) {
            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.DOWN.getCode());
            entity.setUpdateTime(new Date());
            SeaTunnelClientDao.updateById(entity);
            return false;
        }
    }

    @Override
    public SeaTunnelClientLogVO logs(Long id) {
        SeaTunnelClient entity = getEntity(id);

        SeaTunnelClientLogVO vo = new SeaTunnelClientLogVO();
        vo.setClientId(entity.getId());
        vo.setClientName(entity.getClientName());

        try {
            String url = entity.buildBaseApiUrl() + "/logs";
            String content = restTemplate.getForObject(url, String.class);
            vo.setContent(content);
        } catch (Exception e) {
            vo.setContent("获取日志失败：" + e.getMessage());
        }

        return vo;
    }

    @Override
    public void reportHeartbeat(SeaTunnelClientDTO dto) {
        if (dto == null || dto.getId() == null) {
            return;
        }

        SeaTunnelClient entity = getEntity(dto.getId());
        entity.setHeartbeatTime(new Date());
        entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.LIVE.getCode());

        if (StringUtils.isNotBlank(dto.getVersion())) {
            entity.setVersion(dto.getVersion());
        }
        if (StringUtils.isNotBlank(dto.getContainerId())) {
            entity.setContainerId(dto.getContainerId());
        }
        if (StringUtils.isNotBlank(dto.getClientAddress())) {
            entity.setClientAddress(dto.getClientAddress());
        }

        entity.setUpdateTime(new Date());
        SeaTunnelClientDao.updateById(entity);
    }

    /**
     * 校验客户端保存参数
     */
    private void validate(SeaTunnelClientDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("客户端参数不能为空");
        }
        if (StringUtils.isBlank(dto.getClientName())) {
            throw new IllegalArgumentException("客户端名称不能为空");
        }
        if (StringUtils.isBlank(dto.getEngineType())) {
            throw new IllegalArgumentException("引擎类型不能为空");
        }
        if (StringUtils.isBlank(dto.getBaseUrl())) {
            throw new IllegalArgumentException("基础地址不能为空");
        }
    }

    /**
     * 更新客户端启用状态
     */
    private void updateClientStatus(Long id, Integer status) {
        SeaTunnelClient entity = getEntity(id);
        entity.setClientStatus(status);
        entity.setUpdateTime(new Date());
        SeaTunnelClientDao.updateById(entity);
    }

    /**
     * 查询客户端实体，不存在则抛异常
     */
    private SeaTunnelClient getEntity(Long id) {
        SeaTunnelClient entity = SeaTunnelClientDao.queryById(id);
        if (entity == null || Integer.valueOf(1).equals(entity.getIsDeleted())) {
            throw new IllegalArgumentException("客户端不存在");
        }
        return entity;
    }

    /**
     * Entity 转 VO
     */
    private SeaTunnelClientVO toVO(SeaTunnelClient entity) {
        SeaTunnelClientVO vo = new SeaTunnelClientVO();
        BeanUtils.copyProperties(entity, vo);

        vo.setClientStatusName(
                Integer.valueOf(SeaTunnelClientStatusEnum.ENABLED.getCode()).equals(entity.getClientStatus())
                        ? SeaTunnelClientStatusEnum.ENABLED.getDesc()
                        : SeaTunnelClientStatusEnum.DISABLED.getDesc()
        );

        vo.setHealthStatusName(
                Integer.valueOf(SeaTunnelClientHealthStatusEnum.LIVE.getCode()).equals(entity.getHealthStatus())
                        ? SeaTunnelClientHealthStatusEnum.LIVE.getDesc()
                        : SeaTunnelClientHealthStatusEnum.DOWN.getDesc()
        );

        return vo;
    }
}