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
    private String baseUrl;
    private String contextPath;
    private Integer clientStatus;
    private String version;
    private String containerId;
    private String clientAddress;
    private String remark;
}
