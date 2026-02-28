package org.apache.seatunnel.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.apache.seatunnel.admin.service.SeatunnelBatchJobDefinitionService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.communal.utils.CodeGenerateUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Seatunnel Job Definition Controller
 */
@RestController
@RequestMapping("/api/v1/job/batch-definition")
@Validated
@Tag(name = "Batch Job Definition", description = "APIs for managing batch job definitions")
public class SeatunnelBatchJobDefinitionController {

    @Resource
    private SeatunnelBatchJobDefinitionService seatunnelBatchJobDefinitionService;

    @PostMapping("/hocon")
    @Operation(summary = "Build HOCON config", description = "Generate HOCON configuration from job definition")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Config generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid job definition")
    })
    public Result<String> buildHoconConfig(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Job definition data",
                    required = true,
                    content = @Content(examples = @ExampleObject("""
                            {
                                "name": "test-job",
                                "sourceType": "MYSQL",
                                "sinkType": "HIVE",
                                "transformConfig": {...}
                            }
                            """))
            )
            @Valid @RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return Result.buildSuc(seatunnelBatchJobDefinitionService.buildHoconConfig(dto));
    }

    /**
     * Create a new job definition
     *
     * @param dto Job definition data
     * @return Created job definition ID
     */
    @PostMapping
    @Operation(summary = "Create/Update job definition", description = "Save or update a batch job definition")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operation successful"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public Result<Long> saveOrUpdate(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Job definition data",
                    required = true
            )
            @Valid @RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        Long id = seatunnelBatchJobDefinitionService.saveOrUpdate(dto);
        return Result.buildSuc(id);
    }

    /**
     * Get job definition by ID
     *
     * @param id Job definition ID
     * @return Job definition details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get job definition by ID", description = "Retrieve a batch job definition by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Job definition found"),
            @ApiResponse(responseCode = "404", description = "Job definition not found")
    })
    public Result<SeatunnelBatchJobDefinitionVO> selectById(
            @Parameter(description = "Job definition ID", required = true, example = "1001")
            @PathVariable("id") @NotNull Long id) {
        SeatunnelBatchJobDefinitionVO jobDefinition = seatunnelBatchJobDefinitionService.selectById(id);
        return Result.buildSuc(jobDefinition);
    }

    /**
     * Paginate job definitions
     *
     * @param dto Query parameters
     * @return Paginated job definitions
     */
    @PostMapping("/page")
    @Operation(summary = "Pagination query", description = "Get paginated list of job definitions")
    public PaginationResult<SeatunnelBatchJobDefinitionVO> paging(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Pagination and filter parameters",
                    content = @Content(examples = @ExampleObject("""
                            {
                                "pageNum": 1,
                                "pageSize": 10,
                                "name": "test",
                                "status": "ENABLED"
                            }
                            """))
            )
            @RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return seatunnelBatchJobDefinitionService.paging(dto);
    }

    /**
     * Delete job definition
     *
     * @param id Job definition ID
     * @return Delete result
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job definition", description = "Delete a batch job definition by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Job definition not found")
    })
    public Result<Boolean> delete(
            @Parameter(description = "Job definition ID", required = true, example = "1001")
            @PathVariable("id") @NotNull Long id) {
        return Result.buildSuc(seatunnelBatchJobDefinitionService.delete(id));
    }

    @GetMapping("/get-unique-id")
    @Operation(summary = "Generate unique ID", description = "Generate a unique ID for new job definition")
    public Result<Long> getUniqueId() {
        return Result.buildSuc(CodeGenerateUtils.getInstance().genCode());
    }
}