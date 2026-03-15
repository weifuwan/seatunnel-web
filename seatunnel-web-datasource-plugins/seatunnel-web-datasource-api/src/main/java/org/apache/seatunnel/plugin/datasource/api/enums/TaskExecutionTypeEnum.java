package org.apache.seatunnel.plugin.datasource.api.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.seatunnel.plugin.datasource.api.jdbc.CustomQueryStrategy;
import org.apache.seatunnel.plugin.datasource.api.jdbc.QueryStrategy;
import org.apache.seatunnel.plugin.datasource.api.jdbc.SingleTableStrategy;

@AllArgsConstructor
@Getter
public enum TaskExecutionTypeEnum {
    SINGLE_TABLE("SINGLE_TABLE", "单表同步", new SingleTableStrategy()),
    TABLE_CUSTOM("TABLE_CUSTOM", "单表自定义", new CustomQueryStrategy()),
//    MULTI_TABLE("MULTI_TABLE", "多表同步"),
    ;


    public QueryStrategy strategy() {
        return strategy;
    }

    @EnumValue
    private final String code;
    private final String description;
    private final QueryStrategy strategy;
}
