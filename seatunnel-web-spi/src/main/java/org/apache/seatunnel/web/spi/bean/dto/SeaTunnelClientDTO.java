package org.apache.seatunnel.web.spi.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeaTunnelClientDTO {
    private Long id;
    private String clientName;
    private String engineType;
    private String clientAddress;
    private String clientPort;
    private String remark;
}
