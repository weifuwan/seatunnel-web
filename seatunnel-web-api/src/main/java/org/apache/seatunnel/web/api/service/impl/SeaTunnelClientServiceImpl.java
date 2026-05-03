package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.DataSourceService;
import org.apache.seatunnel.web.api.service.SeaTunnelClientService;
import org.apache.seatunnel.web.common.enums.SeaTunnelClientHealthStatusEnum;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.core.utils.MetricValueParser;
import org.apache.seatunnel.web.core.utils.SeaTunnelClientUrlUtils;
import org.apache.seatunnel.web.core.verify.DatasourceConnectivityVerificationStrategy;
import org.apache.seatunnel.web.core.verify.DatasourceConnectivityVerificationStrategyFactory;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.repository.SeaTunnelClientDao;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.apache.seatunnel.web.spi.bean.dto.ClientDatasourceVerifyDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.ClientDatasourceVerifyVO;
import org.apache.seatunnel.web.spi.bean.vo.OptionVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientMetricsVO;
import org.apache.seatunnel.web.spi.enums.DbType;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SeaTunnelClientServiceImpl implements SeaTunnelClientService {

    private static final Set<String> SUPPORTED_CLIENT_VERSIONS = Set.of(
            "2.3.12",
            "2.3.13"
    );

    @Resource
    private SeaTunnelClientDao seaTunnelClientDao;

    @Resource
    private SeaTunnelRestClient seaTunnelRestClient;

    @Resource
    private DataSourceService dataSourceService;

    @Resource
    private DatasourceConnectivityVerificationStrategyFactory strategyFactory;

    @Override
    public void saveOrUpdate(SeaTunnelClientDTO dto) {
        validate(dto);

        Date now = new Date();

        String baseUrl = SeaTunnelClientUrlUtils.buildBaseUrl(
                dto.getClientAddress(),
                dto.getClientPort()
        );

        if (dto.getId() == null) {
            SeaTunnelClient entity = new SeaTunnelClient();
            BeanUtils.copyProperties(dto, entity);

            entity.setBaseUrl(baseUrl);


            fillVersionFromOverview(baseUrl, entity);

            entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.LIVE.getCode());
            entity.setCreateTime(now);
            entity.setUpdateTime(now);

            seaTunnelClientDao.insert(entity);
            return;
        }

        SeaTunnelClient entity = getEntity(dto.getId());
        BeanUtils.copyProperties(dto, entity);

        entity.setBaseUrl(baseUrl);


        fillVersionFromOverview(baseUrl, entity);

        entity.setHealthStatus(SeaTunnelClientHealthStatusEnum.LIVE.getCode());
        entity.setUpdateTime(now);

        seaTunnelClientDao.updateById(entity);
    }

    @Override
    public SeaTunnelClientMetricsVO metrics(Long id) {
        SeaTunnelClient entity = getEntity(id);
        if (entity == null) {
            throw new RuntimeException("entity is null");
        }

        List<Map<String, Object>> metricsList =
                seaTunnelRestClient.systemMonitoringInformation(id);

        Map<String, Object> metricMap =
                (metricsList == null || metricsList.isEmpty()) ? null : metricsList.get(0);

        Double cpuUsage = MetricValueParser.parsePercent(
                metricMap == null ? null : metricMap.get("load.system")
        );
        Double memoryUsage = MetricValueParser.parsePercent(
                metricMap == null ? null : metricMap.get("heap.memory.used/total")
        );
        Integer threadCount = MetricValueParser.parseInteger(
                metricMap == null ? null : metricMap.get("thread.count")
        );
        Integer runningOps = MetricValueParser.parseInteger(
                metricMap == null ? null : metricMap.get("operations.running.count")
        );

        return new SeaTunnelClientMetricsVO(
                cpuUsage,
                memoryUsage,
                threadCount,
                runningOps
        );
    }

    @Override
    public List<OptionVO> option() {
        try {
            List<SeaTunnelClient> entities = seaTunnelClientDao.selectList(new LambdaQueryWrapper<>());
            return entities.stream()
                    .map(item -> {
                        OptionVO optionVO = new OptionVO();
                        optionVO.setValue(item.getId());
                        optionVO.setLabel(item.getClientName());
                        optionVO.setDescription(item.getClientVersion());
                        return optionVO;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new ServiceException(Status.INTERNAL_SERVER_ERROR_ARGS, e.getMessage());
        }
    }

    @Override
    public IPage<SeaTunnelClient> page(SeaTunnelClientPageDTO dto) {
        int pageNo = dto == null || dto.getPageNo() == null || dto.getPageNo() <= 0 ? 1 : dto.getPageNo();
        int pageSize = dto == null || dto.getPageSize() == null || dto.getPageSize() <= 0 ? 10 : dto.getPageSize();

        LambdaQueryWrapper<SeaTunnelClient> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(SeaTunnelClient::getCreateTime);

        return seaTunnelClientDao.selectPage(new Page<>(pageNo, pageSize), wrapper);
    }

    @Override
    public void deleteById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("客户端 ID 不能为空");
        }

        SeaTunnelClient entity = seaTunnelClientDao.selectById(id);
        if (entity == null) {
            throw new IllegalArgumentException("客户端不存在, id=" + id);
        }

        seaTunnelClientDao.deleteById(id);
    }

    @Override
    public ClientDatasourceVerifyVO verifyDatasource(Long clientId, ClientDatasourceVerifyDTO dto) {
        if (clientId == null) {
            throw new IllegalArgumentException("clientId 不能为空");
        }
        if (dto == null || dto.getDatasourceId() == null) {
            throw new IllegalArgumentException("datasourceId 不能为空");
        }

        SeaTunnelClient client = seaTunnelClientDao.selectById(clientId);
        if (client == null) {
            throw new IllegalArgumentException("客户端不存在, clientId=" + clientId);
        }
        if (StringUtils.isBlank(client.getBaseUrl())) {
            throw new IllegalArgumentException("客户端 baseUrl 不能为空, clientId=" + clientId);
        }

        DataSource datasource = dataSourceService.selectById(dto.getDatasourceId());
        if (datasource == null) {
            throw new IllegalArgumentException("数据源不存在, datasourceId=" + dto.getDatasourceId());
        }

        DbType dbType = datasource.getDbType();
        DatasourceConnectivityVerificationStrategy strategy = strategyFactory.getStrategy(dbType);

        long timeoutMs = dto.getTimeoutMs() == null || dto.getTimeoutMs() <= 0
                ? 15000L : dto.getTimeoutMs();
        long pollIntervalMs = dto.getPollIntervalMs() == null || dto.getPollIntervalMs() <= 0
                ? 1000L : dto.getPollIntervalMs();

        return strategy.verify(client, datasource, timeoutMs, pollIntervalMs);
    }

    /**
     * 从 SeaTunnel Client overview 中获取版本。
     *
     * 这里同时承担三个职责：
     * 1. 网络连通性检测：overview 调用失败则不允许保存 / 更新。
     * 2. 版本识别：必须能拿到 projectVersion。
     * 3. 版本限制：目前仅支持 2.3.12 和 2.3.13。
     */
    public void fillVersionFromOverview(String baseUrl, SeaTunnelClient entity) {
        if (StringUtils.isBlank(baseUrl)) {
            throw new IllegalArgumentException("SeaTunnel 客户端地址不能为空");
        }

        Map<String, Object> overview;
        try {
            overview = seaTunnelRestClient.overview(baseUrl + "/overview", null);
        } catch (Exception e) {
            log.warn("Fetch seatunnel client overview failed, baseUrl={}", baseUrl, e);
            throw new ServiceException(
                    Status.INTERNAL_SERVER_ERROR_ARGS,
                    "SeaTunnel 客户端连接失败，请检查客户端地址、端口或 Zeta 引擎是否已启动"
            );
        }

        Object projectVersion = overview == null ? null : overview.get("projectVersion");
        if (projectVersion == null || StringUtils.isBlank(String.valueOf(projectVersion))) {
            throw new ServiceException(
                    Status.INTERNAL_SERVER_ERROR_ARGS,
                    "SeaTunnel 客户端连接成功，但未获取到版本信息"
            );
        }

        String clientVersion = String.valueOf(projectVersion).trim();

        if (!SUPPORTED_CLIENT_VERSIONS.contains(clientVersion)) {
            throw new ServiceException(
                    Status.INTERNAL_SERVER_ERROR_ARGS,
                    String.format(
                            "当前 SeaTunnel 客户端版本为 %s，暂不支持。当前仅支持 %s",
                            clientVersion,
                            String.join("、", SUPPORTED_CLIENT_VERSIONS)
                    )
            );
        }

        entity.setClientVersion(clientVersion);
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
        if (StringUtils.isBlank(dto.getClientAddress())) {
            throw new IllegalArgumentException("客户端地址不能为空");
        }
        if (dto.getClientPort() == null) {
            throw new IllegalArgumentException("客户端端口不能为空");
        }
    }

    /**
     * 查询客户端实体，不存在则抛异常
     */
    private SeaTunnelClient getEntity(Long id) {
        SeaTunnelClient entity = seaTunnelClientDao.queryById(id);
        if (entity == null) {
            throw new IllegalArgumentException("客户端不存在, id=" + id);
        }
        return entity;
    }
}