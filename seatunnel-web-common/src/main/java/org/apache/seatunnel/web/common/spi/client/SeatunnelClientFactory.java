
package org.apache.seatunnel.web.common.spi.client;


import org.apache.seatunnel.web.common.PrioritySPI;
import org.apache.seatunnel.web.common.SPIIdentify;

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
