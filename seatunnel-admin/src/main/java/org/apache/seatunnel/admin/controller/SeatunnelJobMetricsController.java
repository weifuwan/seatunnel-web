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
import org.apache.seatunnel.admin.service.SeatunnelJobMetricsService;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.OverviewChartsVO;
import org.apache.seatunnel.communal.bean.vo.OverviewSummaryVO;
import org.apache.seatunnel.communal.enums.TimeRange;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/job/metrics")
@Tag(name = "Job Metrics", description = "APIs for retrieving job metrics, statistics and charts")
public class SeatunnelJobMetricsController {

    @Resource
    private SeatunnelJobMetricsService seatunnelJobMetricsService;

    @GetMapping("/summary")
    @Operation(
            summary = "Get job summary statistics",
            description = "Retrieve summary statistics for jobs including total count, success rate, failure count, etc."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Summary statistics retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 200,
                        "message": "Success",
                        "data": {
                            "totalJobs": 150,
                            "successJobs": 120,
                            "failedJobs": 20,
                            "runningJobs": 8,
                            "pendingJobs": 2,
                            "successRate": "80%",
                            "avgExecutionTime": "2.5s"
                        },
                        "success": true
                    }
                    """
                            )
                    )
            )
    })
    public Result<OverviewSummaryVO> summary(
            @Parameter(
                    description = "Time range for metrics (H24 = last 24 hours, D7 = last 7 days, D30 = last 30 days)",
                    example = "H24",
                    schema = @Schema(allowableValues = {"H24", "D7", "D30", "ALL"})
            )
            @RequestParam(defaultValue = "H24") TimeRange timeRange,

            @Parameter(
                    description = "Task type to filter by",
                    example = "BATCH",
                    schema = @Schema(allowableValues = {"BATCH", "STREAMING", "ALL"})
            )
            @RequestParam(required = false, defaultValue = "BATCH") String taskType) {
        return Result.buildSuc(seatunnelJobMetricsService.summary(timeRange, taskType));
    }

    @GetMapping("/charts")
    @Operation(
            summary = "Get job chart data",
            description = "Retrieve data for job trend charts including execution counts over time"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Chart data retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                    {
                        "code": 200,
                        "message": "Success",
                        "data": {
                            "dateLabels": ["2024-01-01", "2024-01-02", "2024-01-03"],
                            "successCounts": [45, 52, 48],
                            "failureCounts": [5, 3, 7],
                            "totalCounts": [50, 55, 55],
                            "avgExecutionTimes": [2.1, 2.3, 2.2]
                        },
                        "success": true
                    }
                    """
                            )
                    )
            )
    })
    public Result<OverviewChartsVO> charts(
            @Parameter(
                    description = "Time range for charts (H24 = last 24 hours, D7 = last 7 days, D30 = last 30 days)",
                    example = "D7",
                    schema = @Schema(allowableValues = {"H24", "D7", "D30", "ALL"})
            )
            @RequestParam(defaultValue = "H24") TimeRange timeRange,

            @Parameter(
                    description = "Task type to filter by",
                    example = "BATCH",
                    schema = @Schema(allowableValues = {"BATCH", "STREAMING", "ALL"})
            )
            @RequestParam(required = false, defaultValue = "BATCH") String taskType) {
        return Result.buildSuc(seatunnelJobMetricsService.charts(timeRange, taskType));
    }
}