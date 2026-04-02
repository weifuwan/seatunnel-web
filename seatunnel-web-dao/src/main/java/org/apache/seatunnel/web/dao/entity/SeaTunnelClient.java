package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("t_seatunnel_client")
public class SeaTunnelClient {

    private Long id;

    private String clientName;

    private String engineType;

    private String baseUrl;

    private Integer healthStatus;

    private Date heartbeatTime;

    private String clientVersion;

    private String clientAddress;

    private String clientPort;

    private String remark;

    private Date createTime;

    private Date updateTime;
}
