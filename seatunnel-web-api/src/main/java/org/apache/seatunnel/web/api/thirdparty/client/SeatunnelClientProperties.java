package org.apache.seatunnel.web.api.thirdparty.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "seatunnel.client")
public class SeatunnelClientProperties {

    private String baseUrl;

    private String contextPath = "";

    private int connectTimeoutMs = 2000;
    private int readTimeoutMs = 10000;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getContextPath() { return contextPath; }
    public void setContextPath(String contextPath) { this.contextPath = contextPath; }

    public int getConnectTimeoutMs() { return connectTimeoutMs; }
    public void setConnectTimeoutMs(int connectTimeoutMs) { this.connectTimeoutMs = connectTimeoutMs; }

    public int getReadTimeoutMs() { return readTimeoutMs; }
    public void setReadTimeoutMs(int readTimeoutMs) { this.readTimeoutMs = readTimeoutMs; }

    public String baseApiUrl() {
        String b = baseUrl == null ? "" : baseUrl.trim();
        String c = contextPath == null ? "" : contextPath.trim();
        if (c.isEmpty() || "/".equals(c)) return b;
        if (!c.startsWith("/")) c = "/" + c;
        return b + c;
    }
}
