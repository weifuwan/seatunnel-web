
package org.apache.seatunnel.plugin.client.api.factory;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.spi.client.SeatunnelClient;

import java.util.Map;

@Slf4j
public class SeatunnelClientProvider {

    private static final SeatunnelClientManager seatunnelClientManager = new SeatunnelClientManager();

    static {
        seatunnelClientManager.installPlugin();
    }

    private SeatunnelClientProvider() {
    }

    public static void initialize() {
        log.info("Initialize SeatunnelClientProvider");
    }

    public static SeatunnelClient getSeatunnelClient(@NonNull DbType dbType) {
        return seatunnelClientManager.getSeatunnelClientMap().get(dbType.name());
    }

    public static Map<String, SeatunnelClient> getSeatunnelClientMap() {
        return seatunnelClientManager.getSeatunnelClientMap();
    }

}
