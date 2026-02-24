package org.apache.seatunnel.admin.controller;

import org.apache.seatunnel.admin.service.SeatunnelJobMetricsService;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.communal.bean.vo.OverviewSummaryVO;
import org.apache.seatunnel.communal.enums.TimeRange;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@RequestMapping("/api/v1/job/metrics")
public class SeatunnelJobMetricsController {

    @Resource
    private SeatunnelJobMetricsService seatunnelJobMetricsService;

    @GetMapping("/summary")
    public Result<OverviewSummaryVO> summary(@RequestParam(defaultValue = "H24") TimeRange timeRange,
                                             @RequestParam(required = false, defaultValue = "BATCH") String taskType) {
        return Result.buildSuc(seatunnelJobMetricsService.summary(timeRange, taskType));
    }

    @GetMapping("/charts")
    public Result<OverviewChartsVO> charts(@RequestParam(defaultValue = "H24") TimeRange timeRange,
                                           @RequestParam(required = false, defaultValue = "BATCH") String taskType) {
        return Result.buildSuc(seatunnelJobMetricsService.charts(timeRange, taskType));
    }
}
