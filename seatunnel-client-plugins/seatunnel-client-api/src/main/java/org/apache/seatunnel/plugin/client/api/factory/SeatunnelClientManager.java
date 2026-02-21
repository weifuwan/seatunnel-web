
package org.apache.seatunnel.plugin.client.api.factory;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.PrioritySPIFactory;
import org.apache.seatunnel.communal.spi.client.SeatunnelClient;
import org.apache.seatunnel.communal.spi.client.SeatunnelClientFactory;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static java.lang.String.format;

@Slf4j
public class SeatunnelClientManager {

    private static final Map<String, SeatunnelClient> seatunnelClientMap = new ConcurrentHashMap<>();

    public Map<String, SeatunnelClient> getSeatunnelClientMap() {
        return Collections.unmodifiableMap(seatunnelClientMap);
    }

    public void installPlugin() {

        PrioritySPIFactory<SeatunnelClientFactory> prioritySPIFactory =
                new PrioritySPIFactory<>(SeatunnelClientFactory.class);
        for (Map.Entry<String, SeatunnelClientFactory> entry : prioritySPIFactory.getSPIMap().entrySet()) {
            final SeatunnelClientFactory factory = entry.getValue();
            final String name = entry.getKey();
            if (seatunnelClientMap.containsKey(name)) {
                throw new IllegalStateException(format("Duplicate seatunnel client plugins named '%s'", name));
            }
            loadSeatunnelClient(factory);

            log.info("Registered seatunnel client plugin: {}", name);
        }
    }

    private void loadSeatunnelClient(SeatunnelClientFactory seatunnelClientFactory) {
        SeatunnelClient seatunnelClient = seatunnelClientFactory.create();
        seatunnelClientMap.put(seatunnelClientFactory.getName(), seatunnelClient);
    }

}
