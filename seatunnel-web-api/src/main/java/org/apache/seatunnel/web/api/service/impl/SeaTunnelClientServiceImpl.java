package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.SeaTunnelClientService;
import org.apache.seatunnel.web.common.enums.SeaTunnelClientHealthStatusEnum;
import org.apache.seatunnel.web.common.enums.SeaTunnelClientStatusEnum;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.repository.SeaTunnelClientDao;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientLogVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientMetricsVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class SeaTunnelClientServiceImpl implements SeaTunnelClientService {

    @Resource
    private SeaTunnelClientDao seaTunnelClientDao;

    @Resource
    private RestTemplate restTemplate;

    @Resource
    private SeaTunnelRestClient seaTunnelRestClient;

    @Override
    public void saveOrUpdate(SeaTunnelClientDTO dto) {
        validate(dto);

        Date now = new Date();
        if (dto.getId() == null) {
            SeaTunnelClient entity = new SeaTunnelClient();
            BeanUtils.copyProperties(dto, entity);

            String baseUrl = buildBaseUrl(dto);
            entity.setBaseUrl(baseUrl);

            fillVersionFromOverview(baseUrl, entity);

            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.DOWN.getCode());
            entity.setCreateTime(now);
            entity.setUpdateTime(now);
            seaTunnelClientDao.insert(entity);
            return;
        }

        SeaTunnelClient entity = getEntity(dto.getId());
        BeanUtils.copyProperties(dto, entity);

        String baseUrl = buildBaseUrl(dto);
        entity.setBaseUrl(baseUrl);

        entity.setUpdateTime(now);
        seaTunnelClientDao.updateById(entity);
    }

    private void fillVersionFromOverview(String baseUrl, SeaTunnelClient entity) {
        try {
            Map overview = seaTunnelRestClient.overview(baseUrl + "/overview", null);
            Object projectVersion = overview == null ? null : overview.get("projectVersion");
            if (projectVersion != null) {
                entity.setClientVersion(String.valueOf(projectVersion));
            }
        } catch (Exception e) {
            log.warn("Fetch seatunnel client overview failed, baseUrl={}", baseUrl, e);
        }
    }

    private String buildBaseUrl(SeaTunnelClientDTO dto) {
        String address = dto.getClientAddress();
        String port = dto.getClientPort();

        if (port == null) {
            throw new IllegalArgumentException("clientPort不能为空");
        }

        if (address == null || address.trim().isEmpty()) {
            throw new IllegalArgumentException("clientAddress不能为空");
        }

        address = address.trim();

        if (!address.startsWith("http://") && !address.startsWith("https://")) {
            address = "http://" + address;
        }

        if (address.endsWith("/")) {
            address = address.substring(0, address.length() - 1);
        }

        if (port != null && !port.trim().isEmpty()) {
            return address + ":" + port.trim();
        }

        return address;
    }

    @Override
    public SeaTunnelClientVO selectById(Long id) {
        SeaTunnelClient entity = getEntity(id);
        return toVO(entity);
    }

    @Override
    public void delete(Long id) {
        SeaTunnelClient entity = getEntity(id);
        entity.setUpdateTime(new Date());
        seaTunnelClientDao.updateById(entity);
    }

    @Override
    public IPage<SeaTunnelClientVO> page(SeaTunnelClientPageDTO dto) {
        IPage<SeaTunnelClient> entityPage = seaTunnelClientDao.pageClients(dto);

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
        return seaTunnelClientDao.statistics();
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
        String url = entity.getBaseUrl() + "/health";

        try {
            String result = restTemplate.getForObject(url, String.class);
            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.LIVE.getCode());
            entity.setHeartbeatTime(new Date());
            entity.setUpdateTime(new Date());
            seaTunnelClientDao.updateById(entity);
            return result != null;
        } catch (Exception e) {
            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.DOWN.getCode());
            entity.setUpdateTime(new Date());
            seaTunnelClientDao.updateById(entity);
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
            String url = entity.getBaseUrl() + "/logs";
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


        if (StringUtils.isNotBlank(dto.getClientAddress())) {
            entity.setClientAddress(dto.getClientAddress());
        }

        entity.setUpdateTime(new Date());
        seaTunnelClientDao.updateById(entity);
    }

    @Override
    public SeaTunnelClientMetricsVO metrics(Long id) {
        SeaTunnelClient entity = getEntity(id);

        List<Map<String, Object>> metricsList =
                seaTunnelRestClient.systemMonitoringInformation(id);

        Map<String, Object> metricMap =
                (metricsList == null || metricsList.isEmpty()) ? null : metricsList.get(0);

        Double cpuUsage = parsePercent(metricMap == null ? null : metricMap.get("load.system"));
        Double memoryUsage = parsePercent(metricMap == null ? null : metricMap.get("heap.memory.used/total"));

        return new SeaTunnelClientMetricsVO(
                cpuUsage,
                memoryUsage,
                formatDate(entity.getHeartbeatTime())
        );
    }

    private Double parsePercent(Object value) {
        if (value == null) {
            return null;
        }

        String str = String.valueOf(value).trim();
        if (str.isEmpty()) {
            return null;
        }

        if (str.endsWith("%")) {
            str = str.substring(0, str.length() - 1);
        }

        try {
            return Double.parseDouble(str);
        } catch (Exception e) {
            return null;
        }
    }

    private String formatDate(java.util.Date date) {
        if (date == null) {
            return null;
        }
        return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(date);
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
    }

    /**
     * 更新客户端启用状态
     */
    private void updateClientStatus(Long id, Integer status) {
        SeaTunnelClient entity = getEntity(id);
        entity.setUpdateTime(new Date());
        seaTunnelClientDao.updateById(entity);
    }

    /**
     * 查询客户端实体，不存在则抛异常
     */
    private SeaTunnelClient getEntity(Long id) {
        SeaTunnelClient entity = seaTunnelClientDao.queryById(id);
        return entity;
    }

    /**
     * Entity 转 VO
     */
    private SeaTunnelClientVO toVO(SeaTunnelClient entity) {
        SeaTunnelClientVO vo = new SeaTunnelClientVO();
        BeanUtils.copyProperties(entity, vo);

        vo.setHealthStatusName(
                Integer.valueOf(SeaTunnelClientHealthStatusEnum.LIVE.getCode()).equals(entity.getHealthStatus())
                        ? SeaTunnelClientHealthStatusEnum.LIVE.getDesc()
                        : SeaTunnelClientHealthStatusEnum.DOWN.getDesc()
        );

        return vo;
    }
}