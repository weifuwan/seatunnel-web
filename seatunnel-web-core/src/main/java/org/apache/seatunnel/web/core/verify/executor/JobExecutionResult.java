package org.apache.seatunnel.web.core.verify.executor;

public class JobExecutionResult {

    private boolean success;
    private Long jobId;
    private String finalStatus;
    private String rawLog;
    private String errorMessage;
    private long durationMs;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getFinalStatus() {
        return finalStatus;
    }

    public void setFinalStatus(String finalStatus) {
        this.finalStatus = finalStatus;
    }

    public String getRawLog() {
        return rawLog;
    }

    public void setRawLog(String rawLog) {
        this.rawLog = rawLog;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(long durationMs) {
        this.durationMs = durationMs;
    }
}
