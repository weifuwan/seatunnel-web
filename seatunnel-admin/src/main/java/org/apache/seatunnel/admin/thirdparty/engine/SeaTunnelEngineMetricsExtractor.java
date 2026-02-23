package org.apache.seatunnel.admin.thirdparty.engine;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.thirdparty.metrics.IEngineMetricsExtractor;
import org.apache.seatunnel.common.utils.ExceptionUtils;
import org.apache.seatunnel.common.utils.JsonUtils;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;
import org.apache.seatunnel.communal.exception.SeatunnelErrorEnum;
import org.apache.seatunnel.communal.exception.SeatunnelException;
import org.apache.seatunnel.engine.common.job.JobStatus;
import org.apache.seatunnel.shade.com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.seatunnel.shade.com.fasterxml.jackson.databind.JsonNode;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
/** Engine metrics extractor SeaTunnel Engine implement. */
public class SeaTunnelEngineMetricsExtractor implements IEngineMetricsExtractor {
    @Getter
    @Setter
    private SeaTunnelEngineProxy seaTunnelEngineProxy;

    public static final String[] clusterHealthMetricsKeys =
            new String[]{
                    "processors",
                    "load.systemAverage",
                    "physical.memory.total",
                    "physical.memory.free",
                    "swap.space.total",
                    "swap.space.free",
                    "heap.memory.used",
                    "heap.memory.free",
                    "heap.memory.total",
                    "heap.memory.max",
                    "heap.memory.used/total",
                    "heap.memory.used/max",
                    "minor.gc.count",
                    "minor.gc.time",
                    "major.gc.count",
                    "major.gc.time",
                    "thread.count",
                    "thread.peakCount",
                    "operations.completed.count",
                    "operations.running.count",
                    "operations.pending.invocations.percentage",
                    "operations.pending.invocations.count",
                    "clientEndpoint.count",
                    "connection.active.count",
                    "client.connection.count",
                    "connection.count"
            };

    private SeaTunnelEngineMetricsExtractor() {
        this.seaTunnelEngineProxy = SeaTunnelEngineProxy.getInstance();
    }

    public static SeaTunnelEngineMetricsExtractor getInstance() {
        return SeaTunnelEngineMetricsExtractorHolder.INSTANCE;
    }


    private LinkedHashMap<Integer, SeatunnelJobMetricsPO> extractMetrics(
            LinkedHashMap<Integer, String> jobPipelineStatus, JsonNode jsonNode) {
        LinkedHashMap<Integer, SeatunnelJobMetricsPO> metricsMap = new LinkedHashMap<>();
        JsonNode sourceReceivedCount = jsonNode.get("SourceReceivedCount");
        if (sourceReceivedCount != null && sourceReceivedCount.isArray()) {
            for (JsonNode node : sourceReceivedCount) {
                Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                SeatunnelJobMetricsPO currPipelineMetrics =
                        getOrCreatePipelineMetricsMap(metricsMap, jobPipelineStatus, pipelineId);
                currPipelineMetrics.setReadRowCount(
                        currPipelineMetrics.getReadRowCount() + node.get("value").asLong());
            }
        }

        JsonNode sinkWriteCount = jsonNode.get("SinkWriteCount");
        if (sinkWriteCount != null && sinkWriteCount.isArray()) {
            for (JsonNode node : jsonNode.get("SinkWriteCount")) {
                Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                SeatunnelJobMetricsPO currPipelineMetrics =
                        getOrCreatePipelineMetricsMap(metricsMap, jobPipelineStatus, pipelineId);
                currPipelineMetrics.setWriteRowCount(
                        currPipelineMetrics.getWriteRowCount() + node.get("value").asLong());
            }
        }

        JsonNode sinkWriteQPS = jsonNode.get("SinkWriteQPS");
        if (sinkWriteQPS != null && sinkWriteQPS.isArray()) {
            for (JsonNode node : jsonNode.get("SinkWriteQPS")) {
                Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                SeatunnelJobMetricsPO currPipelineMetrics =
                        getOrCreatePipelineMetricsMap(metricsMap, jobPipelineStatus, pipelineId);
                currPipelineMetrics.setWriteQps(
                        currPipelineMetrics.getWriteQps()
                                + (new Double(node.get("value").asDouble())).longValue());
            }
        }

        JsonNode sourceReceivedQPS = jsonNode.get("SourceReceivedQPS");
        if (sourceReceivedQPS != null && sourceReceivedQPS.isArray()) {
            for (JsonNode node : jsonNode.get("SourceReceivedQPS")) {
                Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                SeatunnelJobMetricsPO currPipelineMetrics =
                        getOrCreatePipelineMetricsMap(metricsMap, jobPipelineStatus, pipelineId);
                currPipelineMetrics.setReadQps(
                        currPipelineMetrics.getReadQps()
                                + (new Double(node.get("value").asDouble())).longValue());
            }
        }

//        JsonNode cdcRecordEmitDelay = jsonNode.get("CDCRecordEmitDelay");
//        if (cdcRecordEmitDelay != null && cdcRecordEmitDelay.isArray()) {
//            Map<Integer, List<Long>> dataMap = new HashMap<>();
//            for (JsonNode node : jsonNode.get("CDCRecordEmitDelay")) {
//                Integer pipelineId = node.get("tags").get("pipelineId").asInt();
//                long value = node.get("value").asLong();
//                dataMap.computeIfAbsent(pipelineId, n -> new ArrayList<>()).add(value);
//            }
//            dataMap.forEach(
//                    (key, value) -> {
//                        SeatunnelJobMetricsPO currPipelineMetrics =
//                                getOrCreatePipelineMetricsMap(metricsMap, jobPipelineStatus, key);
//                        OptionalDouble average = value.stream().mapToDouble(a -> a).average();
//                        currPipelineMetrics.setRecordDelay(
//                                Double.valueOf(average.isPresent() ? average.getAsDouble() : 0)
//                                        .longValue());
//                    });
//        }
        return metricsMap;
    }

    @Override
    public Map<Long, HashMap<Integer, SeatunnelJobMetricsPO>> getAllRunningJobMetrics() {
        HashMap<Long, HashMap<Integer, SeatunnelJobMetricsPO>> allRunningJobMetricsHashMap = new HashMap<>();

        try {
            String allJobMetricsContent = seaTunnelEngineProxy.getAllRunningJobMetricsContent();

            if (StringUtils.isEmpty(allJobMetricsContent)) {
                return new HashMap<>();
            }
            JsonNode jsonNode = JsonUtils.stringToJsonNode(allJobMetricsContent);
            for (JsonNode item : jsonNode) {
                LinkedHashMap<Integer, SeatunnelJobMetricsPO> metricsMap = new LinkedHashMap<>();

                JsonNode sourceReceivedCount = item.get("metrics").get("SourceReceivedCount");
                long jobEngineId = 0L;
                if (sourceReceivedCount != null && sourceReceivedCount.isArray()) {
                    for (JsonNode node : sourceReceivedCount) {
                        jobEngineId = node.get("tags").get("jobId").asLong();
                        Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                        SeatunnelJobMetricsPO currPipelineMetrics =
                                getOrCreatePipelineMetricsMapStatusRunning(metricsMap, pipelineId);
                        currPipelineMetrics.setReadRowCount(
                                currPipelineMetrics.getReadRowCount() + node.get("value").asLong());
                    }
                }

                JsonNode sinkWriteCount = item.get("metrics").get("SinkWriteCount");
                if (sinkWriteCount != null && sinkWriteCount.isArray()) {
                    for (JsonNode node : sinkWriteCount) {
                        jobEngineId = node.get("tags").get("jobId").asLong();
                        Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                        SeatunnelJobMetricsPO currPipelineMetrics =
                                getOrCreatePipelineMetricsMapStatusRunning(metricsMap, pipelineId);
                        currPipelineMetrics.setWriteRowCount(
                                currPipelineMetrics.getWriteRowCount()
                                        + node.get("value").asLong());
                    }
                }

                JsonNode sinkWriteQPS = item.get("metrics").get("SinkWriteQPS");
                if (sinkWriteQPS != null && sinkWriteQPS.isArray()) {
                    for (JsonNode node : sinkWriteQPS) {
                        Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                        SeatunnelJobMetricsPO currPipelineMetrics =
                                getOrCreatePipelineMetricsMapStatusRunning(metricsMap, pipelineId);
                        currPipelineMetrics.setWriteQps(
                                currPipelineMetrics.getWriteQps()
                                        + (new Double(node.get("value").asDouble())).longValue());
                    }
                }

                JsonNode sourceReceivedQPS = item.get("metrics").get("SourceReceivedQPS");
                if (sourceReceivedQPS != null && sourceReceivedQPS.isArray()) {
                    for (JsonNode node : sourceReceivedQPS) {
                        Integer pipelineId = node.get("tags").get("pipelineId").asInt();
                        SeatunnelJobMetricsPO currPipelineMetrics =
                                getOrCreatePipelineMetricsMapStatusRunning(metricsMap, pipelineId);
                        currPipelineMetrics.setReadQps(
                                currPipelineMetrics.getReadQps()
                                        + (new Double(node.get("value").asDouble())).longValue());
                    }
                }

//                JsonNode cdcRecordEmitDelay = item.get("metrics").get("CDCRecordEmitDelay");
//                if (cdcRecordEmitDelay != null && cdcRecordEmitDelay.isArray()) {
//                    Map<Integer, List<Long>> dataMap = new HashMap<>();
//                    for (JsonNode node : cdcRecordEmitDelay) {
//                        Integer pipelineId = node.get("tags").get("pipelineId").asInt();
//                        long value = node.get("value").asLong();
//                        dataMap.computeIfAbsent(pipelineId, n -> new ArrayList<>()).add(value);
//                    }
//                    dataMap.forEach(
//                            (key, value) -> {
//                                SeatunnelJobMetricsPO currPipelineMetrics =
//                                        getOrCreatePipelineMetricsMapStatusRunning(metricsMap, key);
//                                OptionalDouble average =
//                                        value.stream().mapToDouble(a -> a).average();
//                                currPipelineMetrics.setRecordDelay(
//                                        Double.valueOf(
//                                                average.isPresent()
//                                                        ? average.getAsDouble()
//                                                        : 0)
//                                                .longValue());
//                            });
//                }

                log.info("jobEngineId={},metricsMap={}", jobEngineId, metricsMap);

                allRunningJobMetricsHashMap.put(jobEngineId, metricsMap);
            }

        } catch (Exception e) {
            log.error("Failed to fetch running job metrics", e);
        }
        return allRunningJobMetricsHashMap;
    }

    @Override
    public Map<Integer, SeatunnelJobMetricsPO> getMetricsByJobEngineIdRTMap(String jobEngineId) {
        LinkedHashMap<Integer, String> jobPipelineStatus = getJobPipelineStatus(jobEngineId);
        try {
            String metricsContent = seaTunnelEngineProxy.getMetricsContent(jobEngineId);
            if (StringUtils.isEmpty(metricsContent)) {
                return new HashMap<>();
            }

            JsonNode jsonNode = JsonUtils.stringToJsonNode(metricsContent);
            return extractMetrics(jobPipelineStatus, jsonNode);
        } catch (JsonProcessingException e) {
            throw new SeatunnelException(
                    SeatunnelErrorEnum.LOAD_ENGINE_METRICS_JSON_ERROR,
                    "SeaTunnel",
                    ExceptionUtils.getMessage(e));
        }
    }

    @Override
    public JobStatus getJobStatus(@NonNull String jobEngineId) {
        return seaTunnelEngineProxy.getJobStatus(jobEngineId);
    }

    public LinkedHashMap<Integer, String> getJobPipelineStatus(@NonNull String jobEngineId) {
        String jobState = seaTunnelEngineProxy.getJobPipelineStatusStr(jobEngineId);
        LinkedHashMap<Integer, String> pipelineStatusMap = new LinkedHashMap<>();
        try {
            JsonNode jsonNode = JsonUtils.stringToJsonNode(jobState);
            if (jsonNode.get("err") != null) {
                throw new SeatunnelException(
                        SeatunnelErrorEnum.LOAD_ENGINE_METRICS_ERROR, jsonNode.get("err").asText());
            }
            Iterator<Map.Entry<String, JsonNode>> iterator =
                    jsonNode.get("pipelineStateMapperMap").fields();

            while (iterator.hasNext()) {
                Map.Entry<String, JsonNode> next = iterator.next();
                // "PipelineLocation(jobId=650612768629587969, pipelineId=2)"
                String pipelineLocation = next.getKey();
                String pipelineId =
                        pipelineLocation.substring(
                                pipelineLocation.lastIndexOf("=") + 1,
                                pipelineLocation.length() - 1);
                pipelineStatusMap.put(
                        Integer.valueOf(pipelineId),
                        next.getValue().get("pipelineStatus").asText());
            }
        } catch (JsonProcessingException e) {
            throw new SeatunnelException(
                    SeatunnelErrorEnum.LOAD_ENGINE_JOB_STATUS_JSON_ERROR,
                    "SeaTunnel",
                    ExceptionUtils.getMessage(e));
        }
        return pipelineStatusMap;
    }

    private SeatunnelJobMetricsPO getOrCreatePipelineMetricsMapStatusRunning(
            LinkedHashMap<Integer, SeatunnelJobMetricsPO> metricsMap, Integer pipelineId) {
        SeatunnelJobMetricsPO currPipelineMetrics = metricsMap.get(pipelineId);
        if (currPipelineMetrics == null) {
            currPipelineMetrics = new SeatunnelJobMetricsPO();
            currPipelineMetrics.setStatus(JobStatus.RUNNING.toString());
            currPipelineMetrics.setPipelineId(pipelineId);
            metricsMap.put(pipelineId, currPipelineMetrics);
        }
        return currPipelineMetrics;
    }

    private SeatunnelJobMetricsPO getOrCreatePipelineMetricsMap(
            LinkedHashMap<Integer, SeatunnelJobMetricsPO> metricsMap,
            LinkedHashMap<Integer, String> jobPipelineStatus,
            Integer pipelineId) {
        SeatunnelJobMetricsPO currPipelineMetrics = metricsMap.get(pipelineId);
        if (currPipelineMetrics == null) {
            currPipelineMetrics = new SeatunnelJobMetricsPO();
            metricsMap.put(pipelineId, currPipelineMetrics);
            currPipelineMetrics.setStatus(
                    "DEPLOYING".equals(jobPipelineStatus.get(pipelineId))
                            ? JobStatus.SCHEDULED.toString()
                            : JobStatus.valueOf(jobPipelineStatus.get(pipelineId)).toString());
            currPipelineMetrics.setPipelineId(pipelineId);
        }
        return currPipelineMetrics;
    }

    private static class SeaTunnelEngineMetricsExtractorHolder {
        private static final SeaTunnelEngineMetricsExtractor INSTANCE =
                new SeaTunnelEngineMetricsExtractor();
    }
}
