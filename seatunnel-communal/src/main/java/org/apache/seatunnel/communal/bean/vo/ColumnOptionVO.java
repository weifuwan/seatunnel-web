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
public class ColumnOptionVO {

    @ApiModelProperty("key")
    private Integer key;

    @ApiModelProperty("fieldName")
    private Object fieldName;

    @ApiModelProperty("fieldType")
    private Object fieldType;

    @ApiModelProperty("ordinalPosition")
    private Integer ordinalPosition;

    @ApiModelProperty("isNullable")
    private String isNullable;

    @ApiModelProperty("fieldComment")
    private String fieldComment;

    @ApiModelProperty("fieldKey")
    private String fieldKey;
}