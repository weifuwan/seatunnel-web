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
import jakarta.validation.constraints.NotNull;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


/**
 * Seatunnel Job Instance Controller
 */
@RestController
@RequestMapping("/api/v1/job/batch-instance")
@Validated
@Tag(name = "Batch Job Instance", description = "APIs for managing batch job instances and execution logs")
public class SeatunnelBatchJobInstanceController {

    @Resource
    private SeatunnelJobInstanceService seatunnelJobInstanceService;


    /**
     * Paginate job instance
     *
     * @param dto Query parameters
     * @return Paginated job definitions
     */
    @PostMapping("/page")
    @Operation(summary = "Pagination query", description = "Get paginated list of job instances")
    public PaginationResult<SeatunnelJobInstanceVO> paging(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Pagination and filter parameters",
                    content = @Content(examples = @ExampleObject("""
                {
                    "pageNum": 1,
                    "pageSize": 10,
                    "jobDefinitionId": 1001,
                    "status": "RUNNING",
                    "startTime": "2024-01-01 00:00:00",
                    "endTime": "2024-01-31 23:59:59"
                }
                """))
            )
            @RequestBody SeatunnelJobInstanceDTO dto) {
        return seatunnelJobInstanceService.paging(dto);
    }

    /**
     * Get job instance by ID
     *
     * @param id Job instance ID
     * @return Job instance details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get job instance by ID", description = "Retrieve a job instance by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Job instance found"),
            @ApiResponse(responseCode = "404", description = "Job instance not found")
    })
    public Result<SeatunnelJobInstanceVO> selectById(
            @Parameter(description = "Job instance ID", required = true, example = "10001")
            @PathVariable("id") @NotNull Long id) {
        SeatunnelJobInstanceVO jobInstance = seatunnelJobInstanceService.selectById(id);
        return Result.buildSuc(jobInstance);
    }

    @GetMapping("/{instanceId}/log")
    @Operation(summary = "Get job log", description = "Retrieve execution log for a specific job instance")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Log retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Job instance not found or log not available")
    })
    public Result<String> getLog(
            @Parameter(description = "Job instance ID", required = true, example = "10001")
            @PathVariable Long instanceId) {
        String logContent = seatunnelJobInstanceService.getLogContent(instanceId);
        return Result.buildSuc(logContent);
    }
}