package org.apache.seatunnel.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.seatunnel.admin.service.SeatunnelJobScheduleService;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/job/schedule")
@Validated
@Tag(name = "Job Schedule", description = "APIs for managing job schedules and cron expressions")
public class SeatunnelJobScheduleController {

    @Resource
    private SeatunnelJobScheduleService seatunnelJobScheduleService;

    @GetMapping("/last5-execution-times")
    @Operation(
            summary = "Get last 5 execution times",
            description = "Calculate and return the next 5 execution times based on a cron expression"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Execution times calculated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 200,
                        "message": "Success",
                        "data": [
                            "2024-01-15 10:00:00",
                            "2024-01-15 12:00:00",
                            "2024-01-15 14:00:00",
                            "2024-01-15 16:00:00",
                            "2024-01-15 18:00:00"
                        ],
                        "success": true
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid cron expression",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 400,
                        "message": "Invalid cron expression: 'invalid'",
                        "data": null,
                        "success": false
                    }
                    """
                            )
                    )
            )
    })
    public Result<List<String>> getLast5ExecutionTimes(
            @Parameter(
                    description = "Cron expression to calculate execution times",
                    required = true,
                    example = "0 0 0/2 * * ?",
                    schema = @Schema(
                            description = "Standard cron expression with 6 or 7 fields",
                            example = "0 0 0/2 * * ?"
                    )
            )
            @RequestParam("cron") String cronExpression) {

        return Result.buildSuc(seatunnelJobScheduleService.getLast5ExecutionTimesByCron(cronExpression));
    }

    @GetMapping("/stop-schedule")
    @Operation(
            summary = "Stop a schedule",
            description = "Stop a running job schedule by its ID"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Schedule stopped successfully",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 200,
                        "message": "Success",
                        "data": true,
                        "success": true
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Schedule not found",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 404,
                        "message": "Schedule not found with id: 9999",
                        "data": false,
                        "success": false
                    }
                    """
                            )
                    )
            )
    })
    public Result<Boolean> stopSchedule(
            @Parameter(
                    description = "Schedule ID to stop",
                    required = true,
                    example = "1001"
            )
            @RequestParam("scheduleId") Long scheduleId) {
        return Result.buildSuc(seatunnelJobScheduleService.stopSchedule(scheduleId));
    }

    @GetMapping("/start-schedule")
    @Operation(
            summary = "Start a schedule",
            description = "Start or resume a job schedule by its ID"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Schedule started successfully",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 200,
                        "message": "Success",
                        "data": true,
                        "success": true
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Schedule not found",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 404,
                        "message": "Schedule not found with id: 9999",
                        "data": false,
                        "success": false
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Schedule already running",
                    content = @Content(
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 409,
                        "message": "Schedule is already running",
                        "data": false,
                        "success": false
                    }
                    """
                            )
                    )
            )
    })
    public Result<Boolean> startSchedule(
            @Parameter(
                    description = "Schedule ID to start",
                    required = true,
                    example = "1001"
            )
            @RequestParam("scheduleId") Long scheduleId) {
        return Result.buildSuc(seatunnelJobScheduleService.startSchedule(scheduleId));
    }
}