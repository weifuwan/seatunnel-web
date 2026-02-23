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

            po.setReadRowCount(p.getTotalReadRows());
            po.setWriteRowCount(p.getTotalWriteRows());
            po.setReadQps(p.getLatestReadQps());
            po.setWriteQps(p.getLatestWriteQps());
            po.setRecordDelay(p.getLatestDelay());
            po.setStatus(p.getLatestStatus());

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
        sb.append("Metrics Snapshot:\n");
        sb.append(String.format(
                "%-10s %-15s %-15s %-10s %-10s %-10s %-10s\n",
                "PipelineID",
                "ReadRows",
                "WriteRows",
                "ReadQPS",
                "WriteQPS",
                "Delay(ms)",
                "Status"
        ));

        for (SeatunnelJobMetricsPO m : metrics) {
            sb.append(String.format(
                    "%-10s %-15s %-15s %-10s %-10s %-10s %-10s\n",
                    m.getPipelineId(),
                    m.getReadRowCount(),
                    m.getWriteRowCount(),
                    m.getReadQps(),
                    m.getWriteQps(),
                    m.getRecordDelay(),
                    m.getStatus()
            ));
        }

        return sb.toString();
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

        private long totalReadRows;
        private long totalWriteRows;

        private long latestReadQps;
        private long latestWriteQps;

        private long latestDelay;
        private String latestStatus;

        /**
         * Merge incoming snapshot.
         */
        public synchronized void merge(SeatunnelJobMetricsPO m) {

            this.totalReadRows = m.getReadRowCount();
            this.totalWriteRows = m.getWriteRowCount();
            this.latestReadQps = m.getReadQps();
            this.latestWriteQps = m.getWriteQps();
            this.latestDelay = m.getRecordDelay();
            this.latestStatus = m.getStatus();
        }

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

        public String getLatestStatus() {
            return latestStatus;
        }
    }
}