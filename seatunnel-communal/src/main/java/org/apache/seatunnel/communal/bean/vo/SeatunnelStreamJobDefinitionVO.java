package org.apache.seatunnel.communal.bean.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SeatunnelStreamJobDefinitionVO {

    @TableId(type = IdType.INPUT)
    private Long id;

    private String jobName;

    private String jobDesc;

    private String jobDefinitionInfo;

    private String jobType;

    private Integer jobVersion;

    private String pluginName;

    private Long clientId;

    private int parallelism;

    private String scheduleStatus;

    private String sourceType;

    private String sourceTable;

    private String sinkType;

    private String sinkTable;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss", timezone = "GMT+8")
    private Date updateTime;
}
