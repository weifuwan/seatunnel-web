package org.apache.seatunnel.communal.bean.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@ApiModel
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionVO {

    @ApiModelProperty("value")
    private Object value;

    @ApiModelProperty("label")
    private Object label;
}