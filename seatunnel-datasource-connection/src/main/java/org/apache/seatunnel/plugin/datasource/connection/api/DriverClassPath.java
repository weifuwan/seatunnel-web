package org.apache.seatunnel.plugin.datasource.connection.api;

import java.io.Serializable;
import java.net.URL;
import java.util.List;

public final class DriverClassPath implements Serializable {
    private final List<URL> urls;
    private final String identifier;

    public DriverClassPath(List<URL> urls, String identifier) {
        this.urls = urls;
        this.identifier = identifier;
    }

    public List<URL> getUrls() { return urls; }
    public String getIdentifier() { return identifier; }
}

