package org.apache.seatunnel.web.dao.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_connector_param_meta")
public class ConnectorParamMetaEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String type;

    private String connectorName;

    private String paramName;

    private String paramDesc;

    private String paramType;

    private Integer requiredFlag;

    private String defaultValue;

    private String exampleValue;

    private String paramContext;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}