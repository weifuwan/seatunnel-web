package org.apache.seatunnel.admin.controller;

import org.apache.seatunnel.admin.service.SeatunnelJobScheduleService;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;


@RestController
@RequestMapping("/api/v1/job/schedule")
@Validated
public class SeatunnelJobScheduleController {

    @Resource
    private SeatunnelJobScheduleService seatunnelJobScheduleService;

    @GetMapping("/last5-execution-times")
    public Result<List<String>> getLast5ExecutionTimes(@RequestParam("cron") String cronExpression) {

        return Result.buildSuc(seatunnelJobScheduleService.getLast5ExecutionTimesByCron(cronExpression));
    }

    @GetMapping("/stop-schedule")
    public Result<Boolean> stopSchedule(@RequestParam("scheduleId") Long scheduleId) {
        return Result.buildSuc(seatunnelJobScheduleService.stopSchedule(scheduleId));
    }

    @GetMapping("/start-schedule")
    public Result<Boolean> startSchedule(@RequestParam("scheduleId") Long scheduleId) {
        return Result.buildSuc(seatunnelJobScheduleService.startSchedule(scheduleId));
    }
}