package org.apache.seatunnel.web.core.verify.job;

public class ConnectivityTestJob {

    private String jobName;
    private String jobConfig;
    private String configFormat;
    private boolean cleanupRequired;

    public ConnectivityTestJob() {
    }

    public ConnectivityTestJob(String jobName, String jobConfig, String configFormat, boolean cleanupRequired) {
        this.jobName = jobName;
        this.jobConfig = jobConfig;
        this.configFormat = configFormat;
        this.cleanupRequired = cleanupRequired;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getJobConfig() {
        return jobConfig;
    }

    public void setJobConfig(String jobConfig) {
        this.jobConfig = jobConfig;
    }

    public String getConfigFormat() {
        return configFormat;
    }

    public void setConfigFormat(String configFormat) {
        this.configFormat = configFormat;
    }

    public boolean isCleanupRequired() {
        return cleanupRequired;
    }

    public void setCleanupRequired(boolean cleanupRequired) {
        this.cleanupRequired = cleanupRequired;
    }
}
