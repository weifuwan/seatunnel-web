package org.apache.seatunnel.plugin.client.api.factory;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.spi.client.SeatunnelClient;

import java.util.Map;

@Slf4j
public class SeatunnelClientUtils {

    public SeatunnelClientUtils() {
    }

    public static SeatunnelClient getSeatunnelClient(String clientType) {
        Map<String, SeatunnelClient> seatunnelClientMap = SeatunnelClientProvider.getSeatunnelClientMap();
        if (!seatunnelClientMap.containsKey(clientType)) {
            throw new IllegalArgumentException("illegal client type");
        }
        return seatunnelClientMap.get(clientType);
    }
}
