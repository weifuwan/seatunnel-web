package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("t_seatunnel_cdc_server_ids")
public class CdcServerId {

    @TableId(type = IdType.INPUT)
    private Integer serverId;

    private String jobId;

    private Date allocatedAt;
}
