package org.apache.seatunnel.web.api.metrics;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Capture a small snapshot from SeaTunnel Zeta log.
 *
 * <p>
 * This is a simple fallback solution:
 * when a job fails, read the remote Zeta log once and append the last N lines
 * to the local job instance log file.
 * </p>
 */
@Component
@Slf4j
public class ZetaLogSnapshotService {

    /**
     * Dedicated RestTemplate for log snapshot.
     *
     * <p>
     * Do not use the global RestTemplate here, because the Zeta log file may be huge.
     * A short timeout prevents job failure handling from being blocked for too long.
     * </p>
     */
    private final RestTemplate snapshotRestTemplate;

    @Value("${seatunnel.log.snapshot-url:http://192.168.1.115:8080/log/seatunnel-engine-server.log}")
    private String snapshotUrl;

    @Value("${seatunnel.log.snapshot-lines:200}")
    private int snapshotLines;

    /**
     * Connect timeout for snapshot request.
     */
    @Value("${seatunnel.log.snapshot-connect-timeout-ms:3000}")
    private int snapshotConnectTimeoutMs;

    /**
     * Read timeout for snapshot request.
     */
    @Value("${seatunnel.log.snapshot-read-timeout-ms:10000}")
    private int snapshotReadTimeoutMs;

    public ZetaLogSnapshotService() {
        this.snapshotRestTemplate = createSnapshotRestTemplate(3000, 10000);
    }

    public void appendFailureSnapshot(String localLogPath, Long instanceId, Long engineId) {
        if (StringUtils.isBlank(localLogPath)) {
            log.warn("Skip Zeta log snapshot because local log path is blank, instanceId={}", instanceId);
            return;
        }

        JobFileLogger jobLogger = new JobFileLogger(localLogPath);

        try {
            jobLogger.info("");
            jobLogger.info("========== Zeta Failure Log Snapshot Start ==========");
            jobLogger.info("instanceId: " + instanceId);
            jobLogger.info("engineId: " + engineId);
            jobLogger.info("snapshotUrl: " + snapshotUrl);
            jobLogger.info("snapshotLines: " + snapshotLines);
            jobLogger.info("snapshotConnectTimeoutMs: " + snapshotConnectTimeoutMs);
            jobLogger.info("snapshotReadTimeoutMs: " + snapshotReadTimeoutMs);

            if (StringUtils.isBlank(snapshotUrl)) {
                jobLogger.warn("Zeta log snapshot url is blank, skip snapshot");
                return;
            }

            String content = getSnapshotContent();

            if (StringUtils.isBlank(content)) {
                jobLogger.warn("Zeta log snapshot content is empty");
                return;
            }

            List<String> lines = Arrays.stream(content.split("\\r?\\n"))
                    .filter(StringUtils::isNotBlank)
                    .collect(Collectors.toList());

            if (lines.isEmpty()) {
                jobLogger.warn("Zeta log snapshot has no valid lines");
                return;
            }

            int safeLines = Math.max(snapshotLines, 1);
            int fromIndex = Math.max(0, lines.size() - safeLines);

            jobLogger.info("Remote Zeta log total lines: " + lines.size());
            jobLogger.info("Append Zeta log lines from " + (fromIndex + 1) + " to " + lines.size());

            for (int i = fromIndex; i < lines.size(); i++) {
                jobLogger.raw(lines.get(i));
            }

        } catch (Exception e) {
            jobLogger.warn("Append Zeta failure log snapshot failed: " + e.getMessage());
            log.warn(
                    "Append Zeta failure log snapshot failed, instanceId={}, engineId={}, localLogPath={}",
                    instanceId,
                    engineId,
                    localLogPath,
                    e
            );
        } finally {
            jobLogger.info("========== Zeta Failure Log Snapshot End ==========");
            jobLogger.info("");
            jobLogger.close();
        }
    }

    private String getSnapshotContent() {
        RestTemplate restTemplate = createSnapshotRestTemplate(
                snapshotConnectTimeoutMs,
                snapshotReadTimeoutMs
        );

        return restTemplate.getForObject(snapshotUrl, String.class);
    }

    private RestTemplate createSnapshotRestTemplate(int connectTimeoutMs, int readTimeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Math.max(connectTimeoutMs, 1000));
        factory.setReadTimeout(Math.max(readTimeoutMs, 1000));
        return new RestTemplate(factory);
    }
}