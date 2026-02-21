package org.apache.seatunnel.plugin.client.twelve;

import com.google.auto.service.AutoService;
import org.apache.seatunnel.communal.spi.client.SeatunnelClient;
import org.apache.seatunnel.communal.spi.client.SeatunnelClientFactory;


@AutoService(SeatunnelClientFactory.class)
public class TwelveSeatunnelClientFactory implements SeatunnelClientFactory {

    @Override
    public String getName() {
        return "Seatunnel-Client-2.3.12";
    }

    @Override
    public SeatunnelClient create() {
        return new TwelveSeatunnelClient();
    }
}
