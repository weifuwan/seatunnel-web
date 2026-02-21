package org.apache.seatunnel.communal.bean.entity;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;


@Data
public class BaseEntity implements Serializable {
    protected Date createTime;

    protected Date updateTime;
}
