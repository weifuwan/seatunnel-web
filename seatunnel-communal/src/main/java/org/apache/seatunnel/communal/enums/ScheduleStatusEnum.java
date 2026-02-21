package org.apache.seatunnel.communal.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 调度状态枚举
 */
@Getter
@AllArgsConstructor
public enum ScheduleStatusEnum {
    ACTIVE("ACTIVE","ACTIVE"),
    PAUSED("PAUSED","PAUSED");

    @EnumValue
    private final String code;
    private final String description;

}