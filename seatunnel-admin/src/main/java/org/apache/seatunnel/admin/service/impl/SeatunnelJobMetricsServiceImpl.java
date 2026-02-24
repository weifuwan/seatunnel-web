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
import org.apache.seatunnel.communal.bean.vo.ChartDataItemVO;
import org.apache.seatunnel.communal.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.communal.bean.vo.OverviewSummaryVO;
import org.apache.seatunnel.communal.enums.TimeRange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SeatunnelJobMetricsServiceImpl extends ServiceImpl<SeatunnelJobMetricsMapper, SeatunnelJobMetricsPO>
        implements SeatunnelJobMetricsService {

    @Value("${seatunnel.engine.version:2.3.12}")
    private String defaultEngineVersion;

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


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


    @Override
    public OverviewSummaryVO summary(TimeRange timeRange, String taskType) {
        TimeWindow w = parseTimeRange(timeRange);

        Map<String, Object> row = this.getBaseMapper().selectOverviewSummary(
                w.start.format(DT),
                w.end.format(DT),
                taskType
        );

        OverviewSummaryVO dto = new OverviewSummaryVO();
        dto.setTotalRecords(toLong(row.get("totalRecords")));
        dto.setTotalBytes(toLong(row.get("totalBytes")));
        dto.setTotalTasks(toLong(row.get("totalTasks")));


        dto.setSuccessTasks(dto.getTotalTasks());

        return dto;
    }

    @Override
    public OverviewChartsVO charts(TimeRange timeRange, String taskType) {
        TimeWindow w = parseTimeRange(timeRange);
        String granularity = pickGranularity(timeRange);

        List<Map<String, Object>> recordsTrendRows = this.getBaseMapper().selectRecordsTrend(
                w.start.format(DT), w.end.format(DT), taskType, granularity
        );
        List<Map<String, Object>> bytesTrendRows = this.getBaseMapper().selectBytesTrend(
                w.start.format(DT), w.end.format(DT), taskType, granularity
        );
        List<Map<String, Object>> recordsSpeedRows = this.getBaseMapper().selectRecordsSpeedTrend(
                w.start.format(DT), w.end.format(DT), taskType, granularity
        );
        List<Map<String, Object>> bytesSpeedRows = this.getBaseMapper().selectBytesSpeedTrend(
                w.start.format(DT), w.end.format(DT), taskType, granularity
        );

        OverviewChartsVO dto = new OverviewChartsVO();
        dto.setRecordsTrend(toChartItems(recordsTrendRows));
        dto.setBytesTrend(toChartItems(bytesTrendRows));
        dto.setRecordsSpeedTrend(toChartItems(recordsSpeedRows));
        dto.setBytesSpeedTrend(toChartItems(bytesSpeedRows));
        return dto;
    }

    private List<ChartDataItemVO> toChartItems(List<Map<String, Object>> rows) {
        List<ChartDataItemVO> list = new ArrayList<>(rows.size());
        for (Map<String, Object> r : rows) {
            ChartDataItemVO item = new ChartDataItemVO();
            item.setDate(String.valueOf(r.get("date")));
            item.setValue(toLong(r.get("value")));
            list.add(item);
        }
        return list;
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(v.toString());
    }

    private TimeWindow parseTimeRange(TimeRange timeRange) {
        LocalDateTime end = LocalDateTime.now(ZONE_ID);
        TimeRange tr = (timeRange == null) ? TimeRange.H24 : timeRange;
        LocalDateTime start = end.minus(tr.duration());
        return new TimeWindow(start, end);
    }

    private String pickGranularity(TimeRange timeRange) {
        TimeRange tr = (timeRange == null) ? TimeRange.H24 : timeRange;
        return tr.granularity();
    }


    private static class TimeWindow {
        private final LocalDateTime start;
        private final LocalDateTime end;

        private TimeWindow(LocalDateTime start, LocalDateTime end) {
            this.start = start;
            this.end = end;
        }
    }
}