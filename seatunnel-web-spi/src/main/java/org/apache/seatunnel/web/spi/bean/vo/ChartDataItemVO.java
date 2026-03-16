package org.apache.seatunnel.web.spi.bean.vo;

import lombok.Data;

@Data
public class ChartDataItemVO {
    private String date;
    private Double value;
    private String unit;
}
