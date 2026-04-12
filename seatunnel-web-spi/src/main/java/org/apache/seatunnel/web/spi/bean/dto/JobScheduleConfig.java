package org.apache.seatunnel.web.spi.bean.dto;

import lombok.Data;
import org.apache.seatunnel.web.common.enums.ScheduleStatusEnum;

import java.util.List;
import java.util.Map;

@Data
public class JobScheduleConfig {

    private List<ScheduleParamItem> paramsList;

    private String instanceGenerateMode;
    private String scheduleRunType;

    private String timeoutMode;
    private Integer timeoutValue;
    private String timeoutUnit;

    private String rerunPolicy;
    private Boolean autoRetry;
    private Integer retryTimes;
    private Integer retryInterval;

    private String scheduleType;
    private String hourMode;

    private Map<String, Object> hourlyRangeValue;
    private Map<String, Object> hourlyAppointValue;
    private Map<String, Object> dailyValue;
    private Map<String, Object> weeklyValue;

    private String effectType;
    private String cronExpression;

    /**
     * ACTIVE / INACTIVE 等，按你项目枚举定义来
     */
    private ScheduleStatusEnum scheduleStatus;

    @Data
    public static class ScheduleParamItem {
        private String key;
        private String paramName;
        private String paramValue;
    }
}
