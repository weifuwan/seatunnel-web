package org.apache.seatunnel.web.api.controller;

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
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.SeatunnelStreamJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


/**
 * Seatunnel Stream Job Definition Controller
 */
@RestController
@RequestMapping("/api/v1/job/stream-definition")
@Validated
@Tag(name = "Stream Job Definition", description = "APIs for managing stream job definitions")
public class SeaTunnelStreamJobDefinitionController {

    @Resource
    private StreamingJobDefinitionService streamingJobDefinitionService;

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
        return Result.buildSuc(streamingJobDefinitionService.buildHoconConfig(dto));
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
    public Result<Long> saveOrUpdate(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Stream job definition data",
                    required = true
            )
            @Valid @RequestBody SeatunnelStreamingJobDefinitionDTO dto) {
        Long id = streamingJobDefinitionService.saveOrUpdate(dto);
        return Result.buildSuc(id);
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
        SeatunnelStreamJobDefinitionVO jobDefinition = streamingJobDefinitionService.selectById(id);
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
            @RequestBody StreamingJobDefinitionQueryDTO dto) {
        return streamingJobDefinitionService.paging(dto);
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
            @PathVariable("id") @NotNull Long id) {
        return Result.buildSuc(streamingJobDefinitionService.delete(id));
    }
}