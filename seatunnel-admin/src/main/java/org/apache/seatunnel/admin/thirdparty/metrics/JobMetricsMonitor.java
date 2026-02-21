package org.apache.seatunnel.admin.thirdparty.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.service.SeatunnelJobMetricsService;
import org.apache.seatunnel.admin.websocket.WorkflowWebSocketService;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
@Slf4j
public class JobMetricsMonitor {

    /**
     * Map of currently monitored jobs.
     * Key: instanceId, Value: engineId
     */
    private final Map<Long, String> monitoringJobs = new ConcurrentHashMap<>();

    /**
     * In-memory sliding window buffer for metrics aggregation.
     * Key: instanceId, Value: queue of collected metrics
     */
    private final Map<Long, Queue<SeatunnelJobMetricsPO>> metricsBuffer = new ConcurrentHashMap<>();

    /**
     * Logger per job instance for writing metrics to job-specific log files
     */
    private final Map<Long, JobFileLogger> loggers = new ConcurrentHashMap<>();

    @Resource
    private SeatunnelJobMetricsService metricsService;

    @Resource
    private SeatunnelJobInstanceService instanceService;

    @Resource
    private WorkflowWebSocketService webSocketService;

    /**
     * Register a job instance for metrics monitoring
     *
     * @param context runtime context of the job
     */
    public void register(JobRuntimeContext context) {
        Long instanceId = context.getInstanceId();

        // Add to monitoring list
        monitoringJobs.put(instanceId, context.getEngineId());

        // Initialize metrics buffer
        metricsBuffer.put(instanceId, new ConcurrentLinkedQueue<>());

        // Get job log path and create a file logger
        String logPath = instanceService.getById(instanceId).getLogPath();
        JobFileLogger logger = new JobFileLogger(logPath);
        loggers.put(instanceId, logger);

        logger.info("Metrics monitor registered: " + instanceId);
        log.info("Metrics monitor registered: {}", instanceId);
    }

    /**
     * Unregister a job instance from monitoring
     *
     * @param instanceId job instance ID
     */
    public void unregister(Long instanceId) {
        monitoringJobs.remove(instanceId);
        metricsBuffer.remove(instanceId);
        log.info("Metrics monitor unregistered: {}", instanceId);
    }

    /**
     * Scheduled task to push metrics to WebSocket every 2s (default)
     * Pushes current metrics snapshot to the front-end for live monitoring.
     */
    @Scheduled(fixedDelayString = "${seatunnel.metrics.interval-seconds:2000}")
    public void reportAllWebSocket() {
        monitoringJobs.forEach((instanceId, engineId) -> {
            JobFileLogger logger = loggers.get(instanceId);
            try {
                // Fetch metrics from engine
                Map<Integer, SeatunnelJobMetricsPO> metrics =
                        metricsService.getJobMetricsFromEngineMap(engineId);

                if (metrics == null || metrics.isEmpty()) {
                    return;
                }

                // Store metrics in in-memory buffer for later DB aggregation
                Queue<SeatunnelJobMetricsPO> buffer = metricsBuffer.get(instanceId);
                buffer.addAll(metrics.values());

                // Log metrics to job-specific file
                if (logger != null) {
                    String formatted = formatMetrics(metrics.values());
                    logger.info(formatted);
                }

                // Build WebSocket payload and send
                Map<String, Object> message = buildPayload(instanceId, engineId, metrics);
                webSocketService.sendMessage(buildChannel(instanceId, engineId), message);

            } catch (Exception e) {
                log.warn("Metrics fetch failed: {}", instanceId, e);
            }
        });
    }

    /**
     * Scheduled task to flush aggregated metrics to the database every 30s (default)
     * Aggregates all metrics in memory and writes them in batch to improve performance.
     */
    @Scheduled(fixedDelayString = "${seatunnel.metrics.flush-interval:30000}")
    public void flushMetricsToDB() {
        monitoringJobs.keySet().forEach(instanceId -> {
            Queue<SeatunnelJobMetricsPO> buffer = metricsBuffer.get(instanceId);
            JobFileLogger logger = loggers.get(instanceId);

            if (buffer != null && !buffer.isEmpty()) {
                List<SeatunnelJobMetricsPO> toFlush = new ArrayList<>();
                SeatunnelJobMetricsPO m;
                while ((m = buffer.poll()) != null) {
                    toFlush.add(m);
                }

                try {
                    // Save metrics batch to database
                    metricsService.saveMetricsBatch(toFlush);
                    log.info("Flushed {} metrics to DB for instance {}", toFlush.size(), instanceId);
                    if (logger != null) {
                        logger.info("Flushed " + toFlush.size() + " metrics to DB");
                    }
                } catch (Exception e) {
                    log.warn("Failed to flush metrics for instance {}", instanceId, e);
                    if (logger != null) {
                        logger.error("Failed to flush metrics", e);
                        // Optionally re-add metrics back to buffer if DB save fails
                        buffer.addAll(toFlush);
                    }
                }
            }
        });
    }

    /**
     * Format metrics for logging in a human-readable tabular format
     */
    private String formatMetrics(Collection<SeatunnelJobMetricsPO> metrics) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metrics Snapshot:\n");
        sb.append(String.format("%-10s %-15s %-15s %-10s %-10s %-10s %-10s\n",
                "PipelineID", "ReadRows", "WriteRows", "ReadQPS", "WriteQPS", "Delay(ms)", "Status"));

        for (SeatunnelJobMetricsPO m : metrics) {
            sb.append(String.format("%-10s %-15s %-15s %-10s %-10s %-10s %-10s\n",
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
     * Build the WebSocket message payload for a job instance
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
     * Construct the WebSocket channel name for a job instance
     */
    private String buildChannel(Long instanceId, String engineId) {
        return "job-" + instanceId + "-" + engineId;
    }
}
