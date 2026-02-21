package org.apache.seatunnel.communal.bean.dto;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.*;
import org.apache.seatunnel.communal.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.communal.enums.JobMode;
import org.apache.seatunnel.communal.enums.RunMode;

import javax.validation.constraints.NotBlank;
import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = true)
public class SeatunnelJobInstanceDTO extends PaginationBaseDTO {


    private Long id;


    private Long jobDefinitionId;

    private String logPath;


    private String jobConfig;


    private Date startTime;

    private RunMode runMode;

    private Date endTime;

    private JobMode jobType;

    private String errorMessage;

    private String jobStatus;

    private String jobEngineId;

}
