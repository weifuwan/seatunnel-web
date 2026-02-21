
package org.apache.seatunnel.communal.spi.client;


import org.apache.seatunnel.communal.PrioritySPI;
import org.apache.seatunnel.communal.SPIIdentify;

public interface SeatunnelClientFactory extends PrioritySPI {

    /**
     * get seatunnel client
     */
    SeatunnelClient create();

    /**
     * get registry component name
     */
    String getName();

    @Override
    default SPIIdentify getIdentify() {
        return SPIIdentify.builder().name(getName()).build();
    }
}
