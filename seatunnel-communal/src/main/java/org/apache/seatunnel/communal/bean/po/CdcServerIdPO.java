package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("cdc_server_ids")
public class CdcServerIdPO {

    @TableId(type = IdType.INPUT)
    private Integer serverId;

    private String jobId;

    private Date allocatedAt;
}
