package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.dao.SeatunnelJobMetricsMapper;
import org.apache.seatunnel.web.api.service.SeaTunnelJobMetricsService;
import org.apache.seatunnel.web.api.thirdparty.client.SeatunnelEngineRestClient;
import org.apache.seatunnel.web.common.bean.entity.Scale;
import org.apache.seatunnel.web.common.bean.entity.TimeWindow;
import org.apache.seatunnel.web.common.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.web.common.bean.vo.ChartDataItemVO;
import org.apache.seatunnel.web.common.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.web.common.bean.vo.OverviewSummaryVO;
import org.apache.seatunnel.web.common.enums.TimeRange;
import org.apache.seatunnel.web.common.enums.UnitKind;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
public class SeaTunnelJobMetricsServiceImpl
        extends ServiceImpl<SeatunnelJobMetricsMapper, SeatunnelJobMetricsPO>
        implements SeaTunnelJobMetricsService {

    @Resource
    private SeatunnelEngineRestClient engineRestClient;

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
     * Fetch real-time metrics map from engine by jobEngineId.
     */
    @Override
    public Map<Integer, SeatunnelJobMetricsPO> getJobMetricsFromEngineMap(@NonNull Long jobEngineId) {
        Map<String, Object> jobInfo = engineRestClient.jobInfo(jobEngineId);
        if (jobInfo == null) {
            return new ConcurrentHashMap<>();
        }

        Object metricsObj = jobInfo.get("metrics");
        if (!(metricsObj instanceof Map)) {
            return new ConcurrentHashMap<>();
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> metrics = (Map<String, Object>) metricsObj;

        return parseMetricsToPipelineMap(metrics);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private Map<Integer, SeatunnelJobMetricsPO> parseMetricsToPipelineMap(Map<String, Object> metrics) {
        Map<Integer, SeatunnelJobMetricsPO> result = new ConcurrentHashMap<>();
        if (metrics == null || metrics.isEmpty()) {
            return result;
        }

        boolean pipelineKeyed = true;
        for (String k : metrics.keySet()) {
            if (!isNumeric(k)) { pipelineKeyed = false; break; }
        }
        if (pipelineKeyed) {
            for (Map.Entry<String, Object> e : metrics.entrySet()) {
                Integer pid = Integer.valueOf(e.getKey());
                if (!(e.getValue() instanceof Map)) continue;
                Map block = (Map) e.getValue();
                SeatunnelJobMetricsPO po = mapBlock(pid, block);
                result.put(pid, po);
            }
            return result;
        }

        SeatunnelJobMetricsPO po = new SeatunnelJobMetricsPO();
        po.setPipelineId(0);

        po.setReadRowCount(getLong(metrics, "SourceReceivedCount"));
        po.setWriteRowCount(getLong(metrics, "SinkWriteCount"));

        po.setReadQps(getLong(metrics, "SourceReceivedQPS"));
        po.setWriteQps(getLong(metrics, "SinkWriteQPS"));

        po.setReadBytes(getLong(metrics, "SourceReceivedBytes"));
        po.setWriteBytes(getLong(metrics, "SinkWriteBytes"));

        po.setReadBps(getLongFromDouble(metrics, "SourceReceivedBytesPerSeconds"));
        po.setWriteBps(getLongFromDouble(metrics, "SinkWriteBytesPerSeconds"));

        po.setIntermediateQueueSize(getLong(metrics, "IntermediateQueueSize"));

        result.put(0, po);
        return result;
    }

    private long getLongFromDouble(Map<String, Object> m, String key) {
        Object v = getIgnoreCase(m, key);
        if (v == null) return 0L;
        try {
            if (v instanceof Number) return ((Number) v).longValue();
            return (long) Double.parseDouble(String.valueOf(v));
        } catch (Exception e) {
            return 0L;
        }
    }

    private SeatunnelJobMetricsPO mapBlock(Integer pid, Map block) {
        SeatunnelJobMetricsPO po = new SeatunnelJobMetricsPO();
        po.setPipelineId(pid);

        po.setReadRowCount(getLong(block, "readRowCount", "ReadRowCount", "SourceReceivedCount", "sourceReceivedCount"));
        po.setWriteRowCount(getLong(block, "writeRowCount", "WriteRowCount", "SinkWriteCount", "sinkWriteCount"));

        po.setReadQps(getLong(block, "readQps", "ReadQps", "SourceReceivedQPS", "SourceReceivedQps", "sourceReceivedQPS"));
        po.setWriteQps(getLong(block, "writeQps", "WriteQps", "SinkWriteQPS", "SinkWriteQps", "sinkWriteQPS"));

        po.setReadBytes(getLong(block, "readBytes", "ReadBytes", "SourceReceivedBytes", "sourceReceivedBytes"));
        po.setWriteBytes(getLong(block, "writeBytes", "WriteBytes", "SinkWriteBytes", "sinkWriteBytes"));

        po.setReadBps(getLong(block, "readBps", "ReadBps", "SourceReceivedBytesPerSeconds"));
        po.setWriteBps(getLong(block, "writeBps", "WriteBps", "SinkWriteBytesPerSeconds"));

        po.setIntermediateQueueSize(getLong(block, "intermediateQueueSize", "IntermediateQueueSize"));
        po.setRecordDelay(getLong(block, "recordDelay", "RecordDelay", "RecordDelayMs"));

        po.setLagCount(getLong(block, "lagCount", "LagCount"));
        po.setLossRate(getDouble(block, "lossRate", "LossRate"));
        po.setAvgRowSize(getLong(block, "avgRowSize", "AvgRowSize"));

        return po;
    }

    private void applyByMetricName(SeatunnelJobMetricsPO po, String metricName, Number num) {
        if (metricName == null || num == null) return;

        String lower = metricName.toLowerCase(Locale.ROOT);
        long v = num.longValue();
        double d = num.doubleValue();


        if (lower.contains("sourcesreceivedcount") || lower.contains("tablesourcereceivedcount") || lower.contains("readrow")) {
            po.setReadRowCount(v);
        } else if (lower.contains("sinkwritecount") || lower.contains("tablesinkwritecount") || lower.contains("writerow")) {
            po.setWriteRowCount(v);
        } else if (lower.contains("sourcereceivedqps") || lower.contains("readqps")) {
            po.setReadQps(v);
        } else if (lower.contains("sinkwriteqps") || lower.contains("writeqps")) {
            po.setWriteQps(v);
        } else if (lower.contains("sourcereceivedbytes") || lower.contains("readbytes")) {
            po.setReadBytes(v);
        } else if (lower.contains("sinkwritebytes") || lower.contains("writebytes")) {
            po.setWriteBytes(v);
        } else if (lower.contains("bytesperseconds") || lower.contains("bps")) {
            // 这里无法区分读写就不填，或者你根据 metricName 更精确区分
        } else if (lower.contains("intermediatequeuesize")) {
            po.setIntermediateQueueSize(v);
        } else if (lower.contains("recorddelay") || lower.contains("delay")) {
            po.setRecordDelay(v);
        } else if (lower.contains("lagcount")) {
            po.setLagCount(v);
        } else if (lower.contains("lossrate")) {
            po.setLossRate(d);
        } else if (lower.contains("avgrowsize")) {
            po.setAvgRowSize(v);
        }
    }

    private boolean isNumeric(String s) {
        if (s == null) return false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') return false;
        }
        return s.length() > 0;
    }

    private Number toNumber(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number) return (Number) o;
        try {
            String s = String.valueOf(o);
            if (s.contains(".")) return Double.valueOf(s);
            return Long.valueOf(s);
        } catch (Exception e) {
            return 0L;
        }
    }

    private long getLong(Map m, String... keys) {
        for (String k : keys) {
            Object v = getIgnoreCase(m, k);
            if (v != null) return toNumber(v).longValue();
        }
        return 0L;
    }

    private double getDouble(Map m, String... keys) {
        for (String k : keys) {
            Object v = getIgnoreCase(m, k);
            if (v != null) return toNumber(v).doubleValue();
        }
        return 0.0;
    }

    private Object getIgnoreCase(Map m, String key) {
        if (m.containsKey(key)) return m.get(key);
        for (Object k : m.keySet()) {
            if (k != null && key.equalsIgnoreCase(String.valueOf(k))) {
                return m.get(k);
            }
        }
        return null;
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