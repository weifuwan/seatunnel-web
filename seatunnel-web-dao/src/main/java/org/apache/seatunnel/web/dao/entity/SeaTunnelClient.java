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

    private String contextPath;

    private Integer clientStatus;

    private Integer healthStatus;

    private Date heartbeatTime;

    private String version;

    private String containerId;

    private String clientAddress;

    private String remark;

    private Date createTime;

    private Date updateTime;

    private Integer isDeleted;

    public String buildBaseApiUrl() {
        String b = baseUrl == null ? "" : baseUrl.trim();
        String c = contextPath == null ? "" : contextPath.trim();
        if (c.isEmpty() || "/".equals(c)) {
            return b;
        }
        if (!c.startsWith("/")) {
            c = "/" + c;
        }
        return b + c;
    }


}
