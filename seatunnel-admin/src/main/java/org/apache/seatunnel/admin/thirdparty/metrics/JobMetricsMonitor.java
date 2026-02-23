package org.apache.seatunnel.admin.thirdparty.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.service.SeatunnelJobMetricsService;
import org.apache.seatunnel.admin.websocket.WorkflowWebSocketService;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.communal.utils.CodeGenerateUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise-level metrics monitor for Seatunnel job instances.
 * <p>
 * Design principles:
 * 1. Real-time metrics are pushed to WebSocket and written to job log files.
 * 2. Database only stores the final aggregated result when the job finishes.
 * 3. No time-series storage in MySQL.
 * 4. No periodic DB flushing to avoid lock contention.
 */
@Component
@Slf4j
public class JobMetricsMonitor {

    /**
     * Currently monitored jobs.
     * Key: job instance ID
     * Value: engine ID
     */
    private final Map<Long, String> monitoringJobs = new ConcurrentHashMap<>();

    /**
     * In-memory aggregated metrics per job instance.
     * Key: job instance ID
     */
    private final Map<Long, AggregatedMetrics> aggregates = new ConcurrentHashMap<>();

    /**
     * Dedicated file logger per job instance.
     */
    private final Map<Long, JobFileLogger> loggers = new ConcurrentHashMap<>();

    @Resource
    private SeatunnelJobMetricsService metricsService;

    @Resource
    private SeatunnelJobInstanceService instanceService;

    @Resource
    private WorkflowWebSocketService webSocketService;


    /**
     * Register a job instance for real-time metrics monitoring.
     */
    public void register(JobRuntimeContext context) {

        Long instanceId = context.getInstanceId();
        String engineId = context.getEngineId();

        monitoringJobs.put(instanceId, engineId);
        aggregates.put(instanceId, new AggregatedMetrics(instanceId));

        String logPath = instanceService.getById(instanceId).getLogPath();
        loggers.put(instanceId, new JobFileLogger(logPath));

        log.info("Metrics monitor registered for instance {}", instanceId);
    }

    /**
     * Poll metrics from engine periodically and:
     * 1. Update in-memory aggregation
     * 2. Write to job-specific log file
     * 3. Push to WebSocket for real-time UI update
     */
    @Scheduled(fixedDelayString = "${seatunnel.metrics.interval-ms:2000}")
    public void reportAllWebSocket() {

        monitoringJobs.forEach((instanceId, engineId) -> {

            try {

                Map<Integer, SeatunnelJobMetricsPO> metrics =
                        metricsService.getJobMetricsFromEngineMap(engineId);

                if (metrics == null || metrics.isEmpty()) {
                    return;
                }

                // Update in-memory aggregated metrics
                AggregatedMetrics agg = aggregates.get(instanceId);
                if (agg != null) {
                    agg.merge(metrics.values());
                }

                // Write snapshot to job log file
                JobFileLogger logger = loggers.get(instanceId);
                if (logger != null) {
                    logger.info(formatMetrics(metrics.values()));
                }

                // Push metrics snapshot to WebSocket
                webSocketService.sendMessage(
                        buildChannel(instanceId, engineId),
                        buildPayload(instanceId, engineId, metrics)
                );

            } catch (Exception e) {
                log.warn("Failed to fetch metrics for instance {}", instanceId, e);
            }
        });
    }


    /**
     * Persist final aggregated metrics to database.
     * This method should be called when the job reaches a terminal state
     * (FINISHED / FAILED / CANCELED).
     */
    public void finalizeAndPersist(Long instanceId) {

        String engineId = monitoringJobs.get(instanceId);

        if (engineId != null) {
            try {
                Map<Integer, SeatunnelJobMetricsPO> finalMetrics =
                        metricsService.getJobMetricsFromEngineMap(engineId);

                if (finalMetrics != null && !finalMetrics.isEmpty()) {

                    AggregatedMetrics agg = aggregates.get(instanceId);
                    if (agg != null) {
                        agg.merge(finalMetrics.values());
                    }

                    JobFileLogger logger = loggers.get(instanceId);
                    if (logger != null) {
                        logger.info("Final Metrics Snapshot:");
                        logger.info(formatMetrics(finalMetrics.values()));
                    }
                }

            } catch (Exception e) {
                log.warn("Failed to fetch final metrics for instance {}", instanceId, e);
            }
        }

        AggregatedMetrics agg = aggregates.get(instanceId);
        if (agg == null) {
            cleanup(instanceId);
            return;
        }

        List<SeatunnelJobMetricsPO> finalList = new ArrayList<>();

        agg.getPipelines().forEach((pipelineId, p) -> {

            SeatunnelJobMetricsPO po = new SeatunnelJobMetricsPO();
            po.setId(CodeGenerateUtils.getInstance().genCode());
            po.setJobInstanceId(instanceId);
            po.setPipelineId(pipelineId);

            // 基础指标
            po.setReadRowCount(p.getTotalReadRows());
            po.setWriteRowCount(p.getTotalWriteRows());
            po.setReadQps(p.getLatestReadQps());
            po.setWriteQps(p.getLatestWriteQps());
            po.setRecordDelay(p.getLatestDelay());

            po.setReadBytes(p.getTotalReadBytes());
            po.setWriteBytes(p.getTotalWriteBytes());
            po.setReadBps(p.getLatestReadBps());
            po.setWriteBps(p.getLatestWriteBps());
            po.setIntermediateQueueSize(p.getLatestIntermediateQueueSize());
            po.setLagCount(p.getLatestLagCount());
            po.setLossRate(p.getLatestLossRate());
            po.setAvgRowSize(p.getLatestAvgRowSize());

            po.setCreateTime(new Date());
            po.setUpdateTime(new Date());

            finalList.add(po);
        });

        if (!finalList.isEmpty()) {
            metricsService.saveMetricsBatch(finalList);
            log.info("Final metrics persisted for instance {}", instanceId);
        }

        cleanup(instanceId);
    }


    /**
     * Remove monitoring state and release resources.
     */
    private void cleanup(Long instanceId) {

        monitoringJobs.remove(instanceId);
        aggregates.remove(instanceId);

        JobFileLogger logger = loggers.remove(instanceId);
        if (logger != null) {
            logger.close();
        }

        log.info("Metrics monitor cleaned for instance {}", instanceId);
    }


    /**
     * Build WebSocket payload.
     */
    private Map<String, Object> buildPayload(Long instanceId,
                                             String engineId,
                                             Map<Integer, SeatunnelJobMetricsPO> metrics) {

        Map<String, Object> message = new HashMap<>();
        message.put("type", "METRICS");
        message.put("instanceId", instanceId);
        message.put("engineId", engineId);
        message.put("metrics", metrics);
        message.put("timestamp", Instant.now().toEpochMilli());

        return message;
    }

    /**
     * Construct WebSocket channel name.
     */
    private String buildChannel(Long instanceId, String engineId) {
        return "job-" + instanceId + "-" + engineId;
    }

    /**
     * Format metrics snapshot into human-readable table for log file.
     */
    private String formatMetrics(Collection<SeatunnelJobMetricsPO> metrics) {

        StringBuilder sb = new StringBuilder();
        sb.append("\n==================== Metrics Snapshot ====================\n");
        sb.append(String.format(
                "%-10s %-12s %-12s %-8s %-8s %-8s %-12s %-12s %-8s %-8s %-10s %-8s %-8s %-8s\n",
                "PipelineID",
                "ReadRows",
                "WriteRows",
                "ReadQPS",
                "WriteQPS",
                "Delay(ms)",
                "ReadBytes",
                "WriteBytes",
                "ReadBPS",
                "WriteBPS",
                "QueueSize",
                "LagCount",
                "LossRate",
                "AvgRowSize"
        ));
        sb.append("--------------------------------------------------------------------------------\n");

        for (SeatunnelJobMetricsPO m : metrics) {
            sb.append(String.format(
                    "%-10s %-12s %-12s %-8s %-8s %-8s %-12s %-12s %-8s %-8s %-10s %-8s %-8.4f %-8s\n",
                    m.getPipelineId(),
                    formatNumber(m.getReadRowCount()),
                    formatNumber(m.getWriteRowCount()),
                    m.getReadQps(),
                    m.getWriteQps(),
                    m.getRecordDelay(),
                    formatBytes(m.getReadBytes()),
                    formatBytes(m.getWriteBytes()),
                    formatBytes(m.getReadBps()),
                    formatBytes(m.getWriteBps()),
                    m.getIntermediateQueueSize(),
                    m.getLagCount(),
                    m.getLossRate(),
                    m.getAvgRowSize()
            ));
        }
        sb.append("============================================================\n");

        return sb.toString();
    }

    /**
     * 格式化数字，添加千位分隔符
     */
    private String formatNumber(long number) {
        return String.format("%,d", number);
    }

    /**
     * 格式化字节大小为可读格式
     */
    private String formatBytes(Long bytes) {
        if (bytes == null || bytes == 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = (int) (Math.log10(bytes) / Math.log10(1024));
        double size = bytes / Math.pow(1024, unitIndex);

        return String.format("%.2f %s", size, units[unitIndex]);
    }

    /**
     * Aggregated metrics container for a job instance.
     */
    private static class AggregatedMetrics {

        private final Long jobInstanceId;

        /**
         * Key: pipeline ID
         */
        private final Map<Integer, PipelineMetrics> pipelines =
                new ConcurrentHashMap<>();

        public AggregatedMetrics(Long jobInstanceId) {
            this.jobInstanceId = jobInstanceId;
        }

        /**
         * Merge new metrics snapshot into in-memory aggregation.
         */
        public void merge(Collection<SeatunnelJobMetricsPO> metricsList) {

            for (SeatunnelJobMetricsPO m : metricsList) {

                pipelines.computeIfAbsent(
                        m.getPipelineId(),
                        id -> new PipelineMetrics()
                ).merge(m);
            }
        }

        public Map<Integer, PipelineMetrics> getPipelines() {
            return pipelines;
        }
    }

    /**
     * Pipeline-level aggregated metrics.
     * <p>
     * Note:
     * The engine already provides cumulative counters,
     * so we simply overwrite totals instead of incrementing.
     */
    private static class PipelineMetrics {

        // 基础指标
        private long totalReadRows;
        private long totalWriteRows;
        private long latestReadQps;
        private long latestWriteQps;
        private long latestDelay;

        // 新增指标
        private Long totalReadBytes;
        private Long totalWriteBytes;
        private Long latestReadBps;
        private Long latestWriteBps;
        private Long latestIntermediateQueueSize;
        private long latestLagCount;
        private double latestLossRate;
        private long latestAvgRowSize;

        /**
         * Merge incoming snapshot.
         */
        public synchronized void merge(SeatunnelJobMetricsPO m) {

            // 基础指标 - 覆盖更新
            this.totalReadRows = m.getReadRowCount();
            this.totalWriteRows = m.getWriteRowCount();
            this.latestReadQps = m.getReadQps();
            this.latestWriteQps = m.getWriteQps();
            this.latestDelay = m.getRecordDelay();

            // 新增指标 - 覆盖更新
            this.totalReadBytes = m.getReadBytes();
            this.totalWriteBytes = m.getWriteBytes();
            this.latestReadBps = m.getReadBps();
            this.latestWriteBps = m.getWriteBps();
            this.latestIntermediateQueueSize = m.getIntermediateQueueSize();
            this.latestLagCount = m.getLagCount();
            this.latestLossRate = m.getLossRate();
            this.latestAvgRowSize = m.getAvgRowSize();
        }

        // Getters
        public long getTotalReadRows() {
            return totalReadRows;
        }

        public long getTotalWriteRows() {
            return totalWriteRows;
        }

        public long getLatestReadQps() {
            return latestReadQps;
        }

        public long getLatestWriteQps() {
            return latestWriteQps;
        }

        public long getLatestDelay() {
            return latestDelay;
        }

        public Long getTotalReadBytes() {
            return totalReadBytes;
        }

        public Long getTotalWriteBytes() {
            return totalWriteBytes;
        }

        public Long getLatestReadBps() {
            return latestReadBps;
        }

        public Long getLatestWriteBps() {
            return latestWriteBps;
        }

        public Long getLatestIntermediateQueueSize() {
            return latestIntermediateQueueSize;
        }

        public long getLatestLagCount() {
            return latestLagCount;
        }

        public double getLatestLossRate() {
            return latestLossRate;
        }

        public long getLatestAvgRowSize() {
            return latestAvgRowSize;
        }

    }
}