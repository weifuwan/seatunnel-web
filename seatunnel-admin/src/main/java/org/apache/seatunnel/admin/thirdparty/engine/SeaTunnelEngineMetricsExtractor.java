package org.apache.seatunnel.admin.thirdparty.engine;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.thirdparty.metrics.IEngineMetricsExtractor;
import org.apache.seatunnel.common.utils.JsonUtils;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.engine.common.job.JobStatus;
import org.apache.seatunnel.shade.com.fasterxml.jackson.databind.JsonNode;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
public class SeaTunnelEngineMetricsExtractor implements IEngineMetricsExtractor {

    @Getter
    @Setter
    private SeaTunnelEngineProxy seaTunnelEngineProxy;

    private SeaTunnelEngineMetricsExtractor() {
        this.seaTunnelEngineProxy = SeaTunnelEngineProxy.getInstance();
    }

    public static SeaTunnelEngineMetricsExtractor getInstance() {
        return Holder.INSTANCE;
    }

    private static class Holder {
        private static final SeaTunnelEngineMetricsExtractor INSTANCE =
                new SeaTunnelEngineMetricsExtractor();
    }


    @Override
    public Map<Long, HashMap<Integer, SeatunnelJobMetricsPO>> getAllRunningJobMetrics() {
        return null;
    }

    @Override
    public Map<Integer, SeatunnelJobMetricsPO> getMetricsByJobEngineIdRTMap(String jobEngineId) {
        try {
            String metricsContent = seaTunnelEngineProxy.getMetricsContent(jobEngineId);
            if (StringUtils.isEmpty(metricsContent)) {
                return new HashMap<>();
            }

            JsonNode root = JsonUtils.stringToJsonNode(metricsContent);
            return extractMetrics(root);

        } catch (Exception e) {
            log.error("Failed to extract metrics for job {}", jobEngineId, e);
            return new HashMap<>();
        }
    }

    @Override
    public JobStatus getJobStatus(String jobEngineId) {
        return seaTunnelEngineProxy.getJobStatus(jobEngineId);
    }


    private LinkedHashMap<Integer, SeatunnelJobMetricsPO> extractMetrics(JsonNode root) {

        LinkedHashMap<Integer, SeatunnelJobMetricsPO> metricsMap = new LinkedHashMap<>();
        log.info("root -> " + root);

        if (root == null || !root.isObject()) {
            log.warn("Root node is null or not an object");
            return metricsMap;
        }

        Iterator<Map.Entry<String, JsonNode>> fields = root.fields();

        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String metricName = entry.getKey();
            JsonNode metricArray = entry.getValue();

            if (!metricArray.isArray()) {
                continue;
            }

            for (JsonNode node : metricArray) {
                try {
                    JsonNode tags = node.get("tags");
                    if (tags == null || !tags.has("pipelineId")) {
                        log.debug("Missing tags or pipelineId in metric node: {}", node);
                        continue;
                    }

                    Integer pipelineId = tags.get("pipelineId").asInt();

                    JsonNode valueNode = node.get("value");
                    if (valueNode == null) {
                        log.debug("Missing value in metric node: {}", node);
                        continue;
                    }

                    SeatunnelJobMetricsPO po =
                            metricsMap.computeIfAbsent(
                                    pipelineId,
                                    k -> {
                                        SeatunnelJobMetricsPO m = new SeatunnelJobMetricsPO();
                                        m.setPipelineId(pipelineId);
                                        return m;
                                    });

                    long longValue = valueNode.asLong();
                    double doubleValue = valueNode.asDouble();

                    accumulateMetric(po, metricName, longValue, doubleValue);

                } catch (Exception e) {
                    log.warn("Error processing metric node: {}", node, e);
                }
            }
        }

        calculateDerivedMetrics(metricsMap);
        return metricsMap;
    }


    private void accumulateMetric(
            SeatunnelJobMetricsPO po,
            String metricName,
            long longValue,
            double doubleValue) {

        if (po == null || metricName == null) {
            log.warn("PO or metricName is null");
            return;
        }

        String pureMetric = metricName.contains("#")
                ? metricName.substring(0, metricName.indexOf("#"))
                : metricName;

        try {
            switch (pureMetric) {
                case "SourceReceivedCount":
                    po.setReadRowCount(po.getReadRowCount() + longValue);
                    break;
                case "SinkWriteCount":
                    po.setWriteRowCount(po.getWriteRowCount() + longValue);
                    break;
                case "SourceReceivedQPS":
                    po.setReadQps(po.getReadQps() + (long) doubleValue);
                    break;
                case "SinkWriteQPS":
                    po.setWriteQps(po.getWriteQps() + (long) doubleValue);
                    break;
                case "SourceReceivedBytes":
                    po.setReadBytes(po.getReadBytes() + longValue);
                    break;
                case "SinkWriteBytes":
                    po.setWriteBytes(po.getWriteBytes() + longValue);
                    break;
                case "SourceReceivedBytesPerSeconds":
                    po.setReadBps(po.getReadBps() + (long) doubleValue);
                    break;
                case "SinkWriteBytesPerSeconds":
                    po.setWriteBps(po.getWriteBps() + (long) doubleValue);
                    break;
                case "IntermediateQueueSize":
                    po.setIntermediateQueueSize(longValue);
                    break;
                default:
                    break;
            }
        } catch (Exception e) {
            log.warn("Error accumulating metric: {}", pureMetric, e);
        }
    }

    private void calculateDerivedMetrics(
            LinkedHashMap<Integer, SeatunnelJobMetricsPO> metricsMap) {

        for (SeatunnelJobMetricsPO po : metricsMap.values()) {

            long read = po.getReadRowCount();
            long write = po.getWriteRowCount();

            if (read > 0) {
                po.setLagCount(read - write);
                po.setLossRate((double) (read - write) / read);
            }

            if (read > 0 && po.getReadBytes() > 0) {
                po.setAvgRowSize(po.getReadBytes() / read);
            }
        }
    }
}