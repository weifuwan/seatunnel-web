package org.apache.seatunnel.web.spi.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.seatunnel.web.common.enums.JobMode;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnvConfig {
    private JobMode jobMode;
    private Integer parallelism;
}
