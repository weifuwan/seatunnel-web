package org.apache.seatunnel.admin.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.dao.SeatunnelJobMetricsMapper;
import org.apache.seatunnel.admin.service.SeatunnelJobMetricsService;
import org.apache.seatunnel.admin.thirdparty.metrics.EngineMetricsExtractorFactory;
import org.apache.seatunnel.admin.thirdparty.metrics.IEngineMetricsExtractor;
import org.apache.seatunnel.communal.bean.entity.Engine;
import org.apache.seatunnel.communal.bean.entity.EngineType;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SeatunnelJobMetricsServiceImpl extends ServiceImpl<SeatunnelJobMetricsMapper, SeatunnelJobMetricsPO>
        implements SeatunnelJobMetricsService {

    @Value("${seatunnel.engine.version:2.3.12}")
    private String defaultEngineVersion;


    private final ConcurrentHashMap<String, IEngineMetricsExtractor> extractorCache = new ConcurrentHashMap<>();

    private IEngineMetricsExtractor getOrCreateExtractor(EngineType type, String version) {
        String key = type.name() + ":" + version;
        return extractorCache.computeIfAbsent(key, k -> {
            Engine engine = new Engine(type, version);
            return new EngineMetricsExtractorFactory(engine).getEngineMetricsExtractor();
        });
    }

    @Override
    public Map<Integer, SeatunnelJobMetricsPO> getJobMetricsFromEngineMap(@NonNull String jobEngineId) {

        return getOrCreateExtractor(EngineType.SeaTunnel, defaultEngineVersion)
                .getMetricsByJobEngineIdRTMap(jobEngineId);
    }

    @Override
    public boolean saveMetricsBatch(@NonNull List<SeatunnelJobMetricsPO> metricsList) {
        int BATCH_SIZE = 1000;
        if (metricsList.isEmpty()) {
            return true;
        }
        return this.saveBatch(metricsList, BATCH_SIZE);
    }
}