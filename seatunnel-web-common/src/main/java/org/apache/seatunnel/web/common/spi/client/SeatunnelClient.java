package org.apache.seatunnel.web.common.spi.client;

public interface SeatunnelClient {

    void jobExecute(String configFile, Long instanceId) throws Exception;

    void jobExecuteUseAdHoc(String configFile) throws Exception;
}
