package org.apache.seatunnel.web.common.bean.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeWindow {
    private LocalDateTime start;
    private LocalDateTime end;
}
