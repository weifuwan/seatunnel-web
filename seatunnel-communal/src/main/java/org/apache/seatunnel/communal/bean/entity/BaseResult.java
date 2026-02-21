package org.apache.seatunnel.communal.bean.entity;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.ToString;
import org.apache.seatunnel.communal.constant.Constant;

import java.io.Serializable;

@Data
@ToString
public class BaseResult implements Serializable {
    private static final long serialVersionUID = -5771016784021901099L;

    @ApiModelProperty(value = "信息", example = "成功")
    protected String message;

    @ApiModelProperty(value = "状态", example = "0")
    protected Integer code;

    public boolean successful() {
        return !this.failed();
    }

    public boolean failed() {
        return !Constant.SUCCESS.equals(code);
    }
}
