package org.apache.seatunnel.communal.spi.client;

public interface SeatunnelClient {

    void jobExecute(String configFile, Long instanceId) throws Exception;

    void jobExecuteUseAdHoc(String configFile) throws Exception;
}
