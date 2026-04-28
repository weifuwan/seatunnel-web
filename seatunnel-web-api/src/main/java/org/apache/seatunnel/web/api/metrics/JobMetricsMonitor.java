package org.apache.seatunnel.web.api.metrics;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.modal.ParsedJobMetrics;
import org.apache.seatunnel.web.api.service.BatchJobInstanceService;
import org.apache.seatunnel.web.api.service.JobMetricsService;
import org.apache.seatunnel.web.api.websocket.WorkflowWebSocketService;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.dao.entity.JobMetrics;
import org.apache.seatunnel.web.dao.entity.JobTableMetrics;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Monitor SeaTunnel job metrics.
 *
 * <p>
 * Responsibilities:
 * 1. Poll real-time metrics from SeaTunnel Engine.
 * 2. Write snapshots to job log file.
 * 3. Push metrics to WebSocket.
 * 4. Persist final metrics when job finishes.
 * </p>
 */
@Component
@Slf4j
public class JobMetricsMonitor {

    private final Map<Long, JobRuntimeContext> monitoringJobs = new ConcurrentHashMap<>();

    private final Map<Long, JobFileLogger> loggers = new ConcurrentHashMap<>();

    @Resource
    private JobMetricsService metricsService;

    @Resource
    private BatchJobInstanceService instanceService;

    @Resource
    private WorkflowWebSocketService webSocketService;

    public void register(JobRuntimeContext context) {
        Long instanceId = context.getInstanceId();

        monitoringJobs.put(instanceId, context);

        try {
            String logPath = instanceService.selectById(instanceId).getLogPath();
            loggers.put(instanceId, new JobFileLogger(logPath));
        } catch (Exception e) {
            log.warn("Failed to create job file logger, instanceId={}", instanceId, e);
        }

        log.info("Metrics monitor registered, instanceId={}, engineId={}",
                instanceId, context.getEngineId());
    }

    @Scheduled(fixedDelayString = "${seatunnel.metrics.interval-ms:2000}")
    public void reportAllWebSocket() {
        monitoringJobs.forEach((instanceId, context) -> {
            try {
                ParsedJobMetrics parsed = metricsService.getJobMetricsFromEngine(
                        context.getClientId(),
                        context.getEngineId()
                );

                if (parsed == null || parsed.isEmpty()) {
                    return;
                }

                attachContext(instanceId, context, parsed);

                JobFileLogger logger = loggers.get(instanceId);
                if (logger != null) {
                    logger.info(formatMetrics(parsed));
                }

                webSocketService.sendMessage(
                        buildChannel(instanceId, context.getEngineId()),
                        buildPayload(instanceId, context.getEngineId(), parsed)
                );
            } catch (Exception e) {
                log.warn("Failed to fetch metrics, instanceId={}", instanceId, e);
            }
        });
    }

    public void finalizeAndPersist(Long instanceId) {
        finalizeAndPersist(instanceId, "FINISHED");
    }

    public void finalizeAndPersist(Long instanceId, String finalStatus) {
        JobRuntimeContext context = monitoringJobs.get(instanceId);

        if (context == null) {
            log.warn("Metrics monitor context not found when finalizing, instanceId={}", instanceId);
            return;
        }

        try {
            ParsedJobMetrics parsed = metricsService.getJobMetricsFromEngine(
                    context.getClientId(),
                    context.getEngineId()
            );

            if (parsed != null && !parsed.isEmpty()) {
                attachContext(instanceId, context, parsed);

                JobFileLogger logger = loggers.get(instanceId);
                if (logger != null) {
                    logger.info("Final Metrics Snapshot:");
                    logger.info(formatMetrics(parsed));
                }

                persistPipelineMetrics(parsed.getPipelineMetrics().values());
                persistTableMetrics(parsed.getTableMetrics());

                log.info("Final metrics persisted, instanceId={}, pipelineCount={}, tableCount={}",
                        instanceId,
                        parsed.getPipelineMetrics() == null ? 0 : parsed.getPipelineMetrics().size(),
                        parsed.getTableMetrics() == null ? 0 : parsed.getTableMetrics().size());
            }

            sendFinalEvent(instanceId, context.getEngineId(), finalStatus);
        } catch (Exception e) {
            log.warn("Failed to finalize metrics, instanceId={}", instanceId, e);
            sendFinalEvent(instanceId, context.getEngineId(), "FAILED");
        } finally {
            cleanup(instanceId);
        }
    }

    private void attachContext(Long instanceId,
                               JobRuntimeContext context,
                               ParsedJobMetrics parsed) {
        if (parsed.getPipelineMetrics() != null) {
            for (JobMetrics item : parsed.getPipelineMetrics().values()) {
                item.setJobInstanceId(instanceId);
                item.setJobDefinitionId(context.getJobDefinitionId());
            }
        }

        if (parsed.getTableMetrics() != null) {
            for (JobTableMetrics item : parsed.getTableMetrics()) {
                item.setJobInstanceId(instanceId);
                item.setJobDefinitionId(context.getJobDefinitionId());
            }
        }
    }

    private void persistPipelineMetrics(Collection<JobMetrics> metricsList) {
        if (metricsList == null || metricsList.isEmpty()) {
            return;
        }

        List<JobMetrics> finalList = new ArrayList<>();

        for (JobMetrics item : metricsList) {
            JobMetrics po = new JobMetrics();

            po.setId(generateId());
            po.setJobInstanceId(item.getJobInstanceId());
            po.setJobDefinitionId(item.getJobDefinitionId());
            po.setPipelineId(item.getPipelineId());

            po.setReadRowCount(defaultLong(item.getReadRowCount()));
            po.setWriteRowCount(defaultLong(item.getWriteRowCount()));
            po.setReadQps(defaultDecimal(item.getReadQps()));
            po.setWriteQps(defaultDecimal(item.getWriteQps()));
            po.setReadBytes(defaultLong(item.getReadBytes()));
            po.setWriteBytes(defaultLong(item.getWriteBytes()));
            po.setReadBps(defaultDecimal(item.getReadBps()));
            po.setWriteBps(defaultDecimal(item.getWriteBps()));
            po.setIntermediateQueueSize(defaultLong(item.getIntermediateQueueSize()));
            po.setLagCount(defaultLong(item.getLagCount()));
            po.setLossRate(defaultDecimal(item.getLossRate()));
            po.setAvgRowSize(defaultLong(item.getAvgRowSize()));
            po.setRecordDelay(defaultLong(item.getRecordDelay()));

            po.setCreateTime(new Date());
            po.setUpdateTime(new Date());

            finalList.add(po);
        }

        metricsService.saveMetricsBatch(finalList);
    }

    private void persistTableMetrics(List<JobTableMetrics> tableMetrics) {
        if (tableMetrics == null || tableMetrics.isEmpty()) {
            return;
        }

        List<JobTableMetrics> finalList = new ArrayList<>();

        for (JobTableMetrics item : tableMetrics) {
            JobTableMetrics po = new JobTableMetrics();

            po.setId(generateId());
            po.setJobInstanceId(item.getJobInstanceId());
            po.setJobDefinitionId(item.getJobDefinitionId());
            po.setPipelineId(item.getPipelineId());

            po.setSourceTable(item.getSourceTable());
            po.setSinkTable(item.getSinkTable());

            po.setReadRowCount(defaultLong(item.getReadRowCount()));
            po.setWriteRowCount(defaultLong(item.getWriteRowCount()));
            po.setReadQps(defaultDecimal(item.getReadQps()));
            po.setWriteQps(defaultDecimal(item.getWriteQps()));
            po.setReadBytes(defaultLong(item.getReadBytes()));
            po.setWriteBytes(defaultLong(item.getWriteBytes()));
            po.setReadBps(defaultDecimal(item.getReadBps()));
            po.setWriteBps(defaultDecimal(item.getWriteBps()));

            po.setStatus(item.getStatus());
            po.setErrorMsg(item.getErrorMsg());

            po.setCreateTime(new Date());
            po.setUpdateTime(new Date());

            finalList.add(po);
        }

        metricsService.saveTableMetricsBatch(finalList);
    }

    private Map<String, Object> buildPayload(Long instanceId,
                                             Long engineId,
                                             ParsedJobMetrics parsed) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "METRICS");
        message.put("instanceId", instanceId);
        message.put("engineId", engineId);
        message.put("pipelineMetrics", parsed.getPipelineMetrics());
        message.put("tableMetrics", parsed.getTableMetrics());
        message.put("timestamp", Instant.now().toEpochMilli());
        return message;
    }

    private void sendFinalEvent(Long instanceId, Long engineId, String status) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "JOB_STATUS");
        message.put("instanceId", instanceId);
        message.put("engineId", engineId);
        message.put("status", status);
        message.put("timestamp", Instant.now().toEpochMilli());

        webSocketService.sendMessage(buildChannel(instanceId, engineId), message);
    }

    private String buildChannel(Long instanceId, Long engineId) {
        return "job-" + instanceId + "-" + engineId;
    }

    private void cleanup(Long instanceId) {
        monitoringJobs.remove(instanceId);

        JobFileLogger logger = loggers.remove(instanceId);
        if (logger != null) {
            try {
                logger.close();
            } catch (Exception e) {
                log.warn("Failed to close job file logger, instanceId={}", instanceId, e);
            }
        }

        log.info("Metrics monitor cleaned, instanceId={}", instanceId);
    }

    private String formatMetrics(ParsedJobMetrics parsed) {
        StringBuilder sb = new StringBuilder();

        sb.append("\n==================== Pipeline Metrics Snapshot ====================\n");
        sb.append(String.format(
                "%-10s %-12s %-12s %-12s %-12s %-12s %-12s %-12s %-12s %-10s\n",
                "PipelineID",
                "ReadRows",
                "WriteRows",
                "ReadQPS",
                "WriteQPS",
                "ReadBytes",
                "WriteBytes",
                "ReadBPS",
                "WriteBPS",
                "QueueSize"
        ));
        sb.append("--------------------------------------------------------------------------------\n");

        if (parsed.getPipelineMetrics() != null) {
            for (JobMetrics item : parsed.getPipelineMetrics().values()) {
                sb.append(String.format(
                        "%-10s %-12s %-12s %-12s %-12s %-12s %-12s %-12s %-12s %-10s\n",
                        item.getPipelineId(),
                        formatNumber(defaultLong(item.getReadRowCount())),
                        formatNumber(defaultLong(item.getWriteRowCount())),
                        defaultDecimal(item.getReadQps()),
                        defaultDecimal(item.getWriteQps()),
                        formatBytes(defaultLong(item.getReadBytes())),
                        formatBytes(defaultLong(item.getWriteBytes())),
                        formatBytes(defaultDecimal(item.getReadBps()).longValue()),
                        formatBytes(defaultDecimal(item.getWriteBps()).longValue()),
                        defaultLong(item.getIntermediateQueueSize())
                ));
            }
        }

        sb.append("==================== Table Metrics Snapshot ====================\n");
        sb.append(String.format(
                "%-40s %-40s %-12s %-12s %-12s %-12s %-12s\n",
                "SourceTable",
                "SinkTable",
                "ReadRows",
                "WriteRows",
                "ReadQPS",
                "WriteQPS",
                "Status"
        ));
        sb.append("--------------------------------------------------------------------------------\n");

        if (parsed.getTableMetrics() != null) {
            for (JobTableMetrics item : parsed.getTableMetrics()) {
                sb.append(String.format(
                        "%-40s %-40s %-12s %-12s %-12s %-12s %-12s\n",
                        safe(item.getSourceTable()),
                        safe(item.getSinkTable()),
                        formatNumber(defaultLong(item.getReadRowCount())),
                        formatNumber(defaultLong(item.getWriteRowCount())),
                        defaultDecimal(item.getReadQps()),
                        defaultDecimal(item.getWriteQps()),
                        safe(item.getStatus())
                ));
            }
        }

        sb.append("============================================================\n");

        return sb.toString();
    }

    private Long generateId() {
        try {
            return CodeGenerateUtils.getInstance().genCode();
        } catch (Exception e) {
            return UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;
        }
    }

    private Long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private BigDecimal defaultDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String formatNumber(long number) {
        return String.format("%,d", number);
    }

    private String formatBytes(Long bytes) {
        if (bytes == null || bytes <= 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = (int) (Math.log10(bytes) / Math.log10(1024));
        unitIndex = Math.min(unitIndex, units.length - 1);

        double size = bytes / Math.pow(1024, unitIndex);
        return String.format("%.2f %s", size, units[unitIndex]);
    }

    private String safe(String value) {
        return value == null ? "-" : value;
    }
}