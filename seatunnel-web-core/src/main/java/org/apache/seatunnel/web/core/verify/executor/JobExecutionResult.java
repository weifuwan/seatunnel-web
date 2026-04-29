package org.apache.seatunnel.web.core.verify.executor;

import lombok.Data;

@Data
public class JobExecutionResult {
    private boolean success;
    private Long jobId;
    private String finalStatus;
    private String rawLog;
    private String errorMessage;
    private long durationMs;
}
