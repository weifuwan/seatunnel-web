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
import org.apache.seatunnel.admin.service.SeatunnelStreamJobDefinitionService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.SeatunnelStreamJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


/**
 * Seatunnel Stream Job Definition Controller
 */
@RestController
@RequestMapping("/api/v1/job/stream-definition")
@Validated
@Tag(name = "Stream Job Definition", description = "APIs for managing stream job definitions")
public class SeatunnelStreamJobDefinitionController {

    @Resource
    private SeatunnelStreamJobDefinitionService seatunnelStreamJobDefinitionService;

    @PostMapping("/hocon")
    @Operation(
            summary = "Build HOCON config",
            description = "Generate HOCON configuration from stream job definition"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Config generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid job definition")
    })
    public Result<String> buildHoconConfig(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Stream job definition data",
                    required = true,
                    content = @Content(examples = @ExampleObject("""
                            {
                                "name": "kafka-to-elasticsearch-stream",
                                "sourceType": "KAFKA",
                                "sourceConfig": {
                                    "bootstrap.servers": "localhost:9092",
                                    "topic": "input-topic",
                                    "group.id": "seatunnel-consumer"
                                },
                                "transformConfig": [
                                    {
                                        "type": "sql",
                                        "sql": "SELECT * FROM source"
                                    }
                                ],
                                "sinkType": "ELASTICSEARCH",
                                "sinkConfig": {
                                    "hosts": ["localhost:9200"],
                                    "index": "output-index"
                                }
                            }
                            """))
            )
            @Valid @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        return Result.buildSuc(seatunnelStreamJobDefinitionService.buildHoconConfig(dto));
    }

    /**
     * Create a new stream job definition
     *
     * @param dto Job definition data
     * @return Created job definition ID
     */
    @PostMapping
    @Operation(
            summary = "Create stream job definition",
            description = "Create a new stream job definition"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Job definition created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Job definition with same name already exists")
    })
    public Result<Long> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Stream job definition data",
                    required = true
            )
            @Valid @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        Long id = seatunnelStreamJobDefinitionService.create(dto);
        return Result.buildSuc(id);
    }

    /**
     * Update an existing stream job definition
     *
     * @param id  Job definition ID
     * @param dto Updated job definition data
     * @return Updated job definition ID
     */
    @PutMapping("/{id}")
    @Operation(
            summary = "Update stream job definition",
            description = "Update an existing stream job definition by ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Job definition updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Job definition not found"),
            @ApiResponse(responseCode = "409", description = "Job definition name conflict")
    })
    public Result<Long> update(
            @Parameter(description = "Job definition ID", required = true, example = "1001")
            @PathVariable("id") @NotNull Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated stream job definition data",
                    required = true
            )
            @Valid @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        Long updatedId = seatunnelStreamJobDefinitionService.update(id, dto);
        return Result.buildSuc(updatedId);
    }

    /**
     * Get stream job definition by ID
     *
     * @param id Job definition ID
     * @return Job definition details
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Get stream job definition by ID",
            description = "Retrieve a stream job definition by its ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Job definition found"),
            @ApiResponse(responseCode = "404", description = "Job definition not found")
    })
    public Result<SeatunnelStreamJobDefinitionVO> selectById(
            @Parameter(description = "Job definition ID", required = true, example = "1001")
            @PathVariable("id") @NotNull Long id) {
        SeatunnelStreamJobDefinitionVO jobDefinition = seatunnelStreamJobDefinitionService.selectById(id);
        return Result.buildSuc(jobDefinition);
    }

    /**
     * Paginate stream job definitions
     *
     * @param dto Query parameters
     * @return Paginated job definitions
     */
    @PostMapping("/page")
    @Operation(
            summary = "Pagination query",
            description = "Get paginated list of stream job definitions"
    )
    public PaginationResult<SeatunnelStreamJobDefinitionVO> paging(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Pagination and filter parameters",
                    content = @Content(examples = @ExampleObject("""
                            {
                                "pageNo": 1,
                                "pageSize": 10,
                                "name": "kafka-stream",
                                "sourceType": "KAFKA",
                                "sinkType": "ELASTICSEARCH",
                                "status": "ENABLED"
                            }
                            """))
            )
            @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        return seatunnelStreamJobDefinitionService.paging(dto);
    }

    /**
     * Delete stream job definition
     *
     * @param id Job definition ID
     * @return Delete result
     */
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete stream job definition",
            description = "Delete a stream job definition by ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Job definition not found"),
            @ApiResponse(responseCode = "409", description = "Job definition has running instances and cannot be deleted")
    })
    public Result<Boolean> delete(
            @Parameter(description = "Job definition ID", required = true, example = "1001")
            @PathVariable("id") @NotNull String id) {
        return Result.buildSuc(seatunnelStreamJobDefinitionService.delete(id));
    }
}