package org.apache.seatunnel.admin.thirdparty.metrics;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.service.SeatunnelJobMetricsService;
import org.apache.seatunnel.admin.websocket.WorkflowWebSocketService;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.communal.utils.CodeGenerateUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

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

        String logPath = instanceService.getById(instanceId).getLogPath();
        loggers.put(instanceId, new JobFileLogger(logPath));

        log.info("Metrics monitor registered for instance {}", instanceId);
    }

    /**
     * Poll metrics from engine periodically and:
     * 1. Write to job-specific log file
     * 2. Push to WebSocket for real-time UI update
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
     * Persist final metrics to database.
     */
    public void finalizeAndPersist(Long instanceId) {
        String engineId = monitoringJobs.get(instanceId);

        if (engineId != null) {
            try {
                Map<Integer, SeatunnelJobMetricsPO> finalMetrics =
                        metricsService.getJobMetricsFromEngineMap(engineId);

                if (finalMetrics != null && !finalMetrics.isEmpty()) {
                    // Write final snapshot to log
                    JobFileLogger logger = loggers.get(instanceId);
                    if (logger != null) {
                        logger.info("Final Metrics Snapshot:");
                        logger.info(formatMetrics(finalMetrics.values()));
                    }

                    // Persist to database
                    persistMetrics(instanceId, finalMetrics.values());
                }

            } catch (Exception e) {
                log.warn("Failed to fetch final metrics for instance {}", instanceId, e);
            }
        }

        cleanup(instanceId);
    }

    private void persistMetrics(Long instanceId, Collection<SeatunnelJobMetricsPO> metricsList) {
        List<SeatunnelJobMetricsPO> finalList = new ArrayList<>();

        for (SeatunnelJobMetricsPO m : metricsList) {
            SeatunnelJobMetricsPO po = new SeatunnelJobMetricsPO();
            try {
                po.setId(CodeGenerateUtils.getInstance().genCode());
            } catch (Exception e) {
                po.setId(UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE);
            }

            po.setJobInstanceId(instanceId);
            po.setPipelineId(m.getPipelineId());


            po.setReadRowCount(m.getReadRowCount());
            po.setWriteRowCount(m.getWriteRowCount());
            po.setReadQps(m.getReadQps());
            po.setWriteQps(m.getWriteQps());
            po.setRecordDelay(m.getRecordDelay());
            po.setReadBytes(m.getReadBytes());
            po.setWriteBytes(m.getWriteBytes());
            po.setReadBps(m.getReadBps());
            po.setWriteBps(m.getWriteBps());
            po.setIntermediateQueueSize(m.getIntermediateQueueSize());
            po.setLagCount(m.getLagCount());
            po.setLossRate(m.getLossRate());
            po.setAvgRowSize(m.getAvgRowSize());

            po.setCreateTime(new Date());
            po.setUpdateTime(new Date());

            finalList.add(po);
        }

        if (!finalList.isEmpty()) {
            metricsService.saveMetricsBatch(finalList);
            log.info("Final metrics persisted for instance {}, {} pipelines",
                    instanceId, finalList.size());
        }
    }

    /**
     * Remove monitoring state and release resources.
     */
    private void cleanup(Long instanceId) {
        monitoringJobs.remove(instanceId);

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


}