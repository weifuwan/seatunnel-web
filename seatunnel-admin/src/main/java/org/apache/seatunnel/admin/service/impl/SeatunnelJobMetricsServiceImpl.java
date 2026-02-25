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
import org.apache.seatunnel.communal.bean.entity.Scale;
import org.apache.seatunnel.communal.bean.entity.TimeWindow;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.communal.bean.vo.ChartDataItemVO;
import org.apache.seatunnel.communal.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.communal.bean.vo.OverviewSummaryVO;
import org.apache.seatunnel.communal.enums.TimeRange;
import org.apache.seatunnel.communal.enums.UnitKind;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of SeatunnelJobMetricsService.
 * <p>
 * Responsibilities:
 * 1. Fetch real-time metrics from engine
 * 2. Persist metrics into database
 * 3. Provide aggregated summary data
 * 4. Provide trend chart data
 * <p>
 * This service acts as the metrics aggregation layer between:
 * - Engine metrics extractor
 * - Database layer
 * - Overview dashboard
 */
@Service
@Slf4j
public class SeatunnelJobMetricsServiceImpl
        extends ServiceImpl<SeatunnelJobMetricsMapper, SeatunnelJobMetricsPO>
        implements SeatunnelJobMetricsService {

    /**
     * Default engine version if not specified.
     */
    @Value("${seatunnel.engine.version:2.3.12}")
    private String defaultEngineVersion;

    /**
     * Default time zone used for metrics calculation.
     */
    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Shanghai");

    /**
     * Standard datetime format used for SQL queries.
     */
    private static final DateTimeFormatter DT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Cache of engine metrics extractors.
     * Key format: engineType:version
     */
    private final ConcurrentHashMap<String, IEngineMetricsExtractor> extractorCache =
            new ConcurrentHashMap<>();

    /**
     * Get or create engine metrics extractor (cached).
     */
    private IEngineMetricsExtractor getOrCreateExtractor(EngineType type, String version) {
        String key = type.name() + ":" + version;
        return extractorCache.computeIfAbsent(key, k -> {
            Engine engine = new Engine(type, version);
            return new EngineMetricsExtractorFactory(engine)
                    .getEngineMetricsExtractor();
        });
    }

    /**
     * Fetch real-time metrics map from engine by jobEngineId.
     */
    @Override
    public Map<Integer, SeatunnelJobMetricsPO> getJobMetricsFromEngineMap(
            @NonNull String jobEngineId) {

        return getOrCreateExtractor(EngineType.SeaTunnel, defaultEngineVersion)
                .getMetricsByJobEngineIdRTMap(jobEngineId);
    }

    /**
     * Batch insert metrics into database.
     */
    @Override
    public void saveMetricsBatch(@NonNull List<SeatunnelJobMetricsPO> metricsList) {
        int BATCH_SIZE = 1000;

        if (metricsList.isEmpty()) {
            return;
        }

        this.saveBatch(metricsList, BATCH_SIZE);
    }

    /**
     * Get overview summary data within given time range.
     * <p>
     * Includes:
     * - total records
     * - total bytes
     * - total tasks
     */
    @Override
    public OverviewSummaryVO summary(TimeRange timeRange, String taskType) {
        TimeWindow w = parseTimeRange(timeRange);

        Map<String, Object> row = this.getBaseMapper().selectOverviewSummary(
                w.getStart().format(DT),
                w.getEnd().format(DT),
                taskType
        );

        OverviewSummaryVO dto = new OverviewSummaryVO();

        long totalRecords = toLong(row.get("totalRecords"));
        long totalBytes = toLong(row.get("totalBytes"));

        Scale recordsScale = pickScaleForSummary(totalRecords, UnitKind.RECORDS);
        dto.setTotalRecords((long) round2(totalRecords / recordsScale.getFactor()));
        dto.setTotalRecordsUnit(recordsScale.getUnit());

        Scale bytesScale = pickScaleForSummary(totalBytes, UnitKind.BYTES);
        dto.setTotalBytes((long) round2(totalBytes / bytesScale.getFactor()));
        dto.setTotalBytesUnit(bytesScale.getUnit());

        dto.setTotalTasks(toLong(row.get("totalTasks")));
        dto.setSuccessTasks(dto.getTotalTasks());

        return dto;
    }

    /**
     * Determine proper display scale based on value for summary.
     */
    private Scale pickScaleForSummary(long value, UnitKind kind) {
        if (kind == UnitKind.RECORDS) {
            if (value >= 100_000_000L)
                return new Scale(100_000_000d, "100M");

            if (value >= 10_000L)
                return new Scale(10_000d, "10K");

            return new Scale(1d, "");
        }

        if (kind == UnitKind.BYTES) {
            if (value >= (1L << 40))
                return new Scale((double) (1L << 40), "TB");

            if (value >= (1L << 30))
                return new Scale((double) (1L << 30), "GB");

            if (value >= (1L << 20))
                return new Scale((double) (1L << 20), "MB");

            if (value >= (1L << 10))
                return new Scale((double) (1L << 10), "KB");

            return new Scale(1d, "B");
        }

        return new Scale(1d, "");
    }

    /**
     * Get chart trend data within given time range.
     * <p>
     * Includes:
     * - Records trend
     * - Bytes trend
     * - Records speed trend
     * - Bytes speed trend
     */
    @Override
    public OverviewChartsVO charts(TimeRange timeRange, String taskType) {
        TimeWindow w = parseTimeRange(timeRange);
        String granularity = pickGranularity(timeRange);

        List<Map<String, Object>> recordsTrendRows =
                this.getBaseMapper().selectRecordsTrend(
                        w.getStart().format(DT),
                        w.getEnd().format(DT),
                        taskType,
                        granularity
                );

        List<Map<String, Object>> bytesTrendRows =
                this.getBaseMapper().selectBytesTrend(
                        w.getStart().format(DT),
                        w.getEnd().format(DT),
                        taskType,
                        granularity
                );

        List<Map<String, Object>> recordsSpeedRows =
                this.getBaseMapper().selectRecordsSpeedTrend(
                        w.getStart().format(DT),
                        w.getEnd().format(DT),
                        taskType,
                        granularity
                );

        List<Map<String, Object>> bytesSpeedRows =
                this.getBaseMapper().selectBytesSpeedTrend(
                        w.getStart().format(DT),
                        w.getEnd().format(DT),
                        taskType,
                        granularity
                );

        OverviewChartsVO dto = new OverviewChartsVO();
        dto.setRecordsTrend(toChartItems(recordsTrendRows, UnitKind.RECORDS));
        dto.setBytesTrend(toChartItems(bytesTrendRows, UnitKind.BYTES));
        dto.setRecordsSpeedTrend(toChartItems(recordsSpeedRows, UnitKind.RAW));
        dto.setBytesSpeedTrend(toChartItems(bytesSpeedRows, UnitKind.RAW));

        return dto;
    }

    /**
     * Determine proper display scale based on max value.
     * <p>
     * Example:
     * - Records → 10K / 100M / records
     * - Bytes → KB / MB / GB / TB
     */
    private Scale pickScale(UnitKind kind, List<Map<String, Object>> rows) {

        long max = 0L;
        for (Map<String, Object> r : rows) {
            long v = toLong(r.get("value"));
            if (v > max) max = v;
        }

        if (kind == UnitKind.RECORDS) {
            if (max >= 100_000_000L)
                return new Scale(100_000_000d, "100M records");

            if (max >= 10_000L)
                return new Scale(10_000d, "10K records");

            return new Scale(1d, "records");
        }

        if (kind == UnitKind.BYTES) {
            if (max >= (1L << 40))
                return new Scale((double) (1L << 40), "TB");

            if (max >= (1L << 30))
                return new Scale((double) (1L << 30), "GB");

            if (max >= (1L << 20))
                return new Scale((double) (1L << 20), "MB");

            if (max >= (1L << 10))
                return new Scale((double) (1L << 10), "KB");

            return new Scale(1d, "B");
        }

        return new Scale(1d, "");
    }

    /**
     * Convert database rows into chart data items.
     */
    private List<ChartDataItemVO> toChartItems(
            List<Map<String, Object>> rows,
            UnitKind kind) {

        Scale scale = pickScale(kind, rows);

        List<ChartDataItemVO> list = new ArrayList<>(rows.size());

        for (Map<String, Object> r : rows) {
            ChartDataItemVO item = new ChartDataItemVO();

            item.setDate(String.valueOf(r.get("date")));

            long raw = toLong(r.get("value"));
            double shown = raw / scale.getFactor();

            item.setValue(round2(shown));
            item.setUnit(scale.getUnit());

            list.add(item);
        }

        return list;
    }

    /**
     * Round to 2 decimal places.
     */
    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    /**
     * Safe object-to-long conversion.
     */
    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(v.toString());
    }

    /**
     * Parse time range into TimeWindow.
     */
    private TimeWindow parseTimeRange(TimeRange timeRange) {
        LocalDateTime end = LocalDateTime.now(ZONE_ID);
        TimeRange tr = (timeRange == null) ? TimeRange.H24 : timeRange;
        LocalDateTime start = end.minus(tr.duration());
        return new TimeWindow(start, end);
    }

    /**
     * Determine granularity (hour/day/minute) based on time range.
     */
    private String pickGranularity(TimeRange timeRange) {
        TimeRange tr = (timeRange == null) ? TimeRange.H24 : timeRange;
        return tr.granularity();
    }
}