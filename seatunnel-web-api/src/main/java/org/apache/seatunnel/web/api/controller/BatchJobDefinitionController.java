package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.exceptions.ApiException;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static org.apache.seatunnel.web.spi.enums.Status.*;

@Slf4j
@RestController
@Validated
@Tag(name = "BATCH_JOB_DEFINITION_TAG")
@RequestMapping("/api/v1/job/batch-definition")
public class BatchJobDefinitionController {

    @Resource
    private BatchJobDefinitionService batchJobDefinitionService;

    /**
     * Creates or updates a batch job definition.
     */
    @PostMapping("/saveOrUpdate")
    @Operation(summary = "saveOrUpdateBatchJobDefinition", description = "SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_NOTES")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveOrUpdate(@RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return Result.buildSuc(batchJobDefinitionService.saveOrUpdate(dto));
    }

    /**
     * Retrieves batch job definition details by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "selectBatchJobDefinitionById", description = "SELECT_BATCH_JOB_DEFINITION_BY_ID_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<BatchJobDefinitionVO> selectById(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.selectById(id));
    }

    /**
     * Performs pagination query for batch job definitions.
     */
    @PostMapping("/page")
    @Operation(summary = "queryBatchJobDefinitionPaging", description = "QUERY_BATCH_JOB_DEFINITION_PAGING_NOTES")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public PaginationResult<BatchJobDefinitionVO> paging(
            @RequestBody BatchJobDefinitionQueryDTO dto) {
        return batchJobDefinitionService.paging(dto);
    }

    /**
     * Deletes a batch job definition by ID.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "deleteBatchJobDefinition", description = "DELETE_BATCH_JOB_DEFINITION_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(DELETE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> delete(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.delete(id));
    }

    /**
     * Builds HOCON config based on batch job definition parameters.
     */
    @PostMapping("/buildHoconConfig")
    @Operation(summary = "buildBatchJobHoconConfig", description = "BUILD_BATCH_JOB_HOCON_CONFIG_NOTES")
    @ApiException(BUILD_BATCH_JOB_HOCON_CONFIG_ERROR)
    public Result<String> buildHoconConfig(@RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return Result.buildSuc(batchJobDefinitionService.buildHoconConfig(dto));
    }

    /**
     * Generates a unique ID.
     */
    @GetMapping("/get-unique-id")
    @Operation(summary = "getBatchJobUniqueId", description = "GET_BATCH_JOB_UNIQUE_ID_NOTES")
    @ApiException(GET_BATCH_JOB_UNIQUE_ID_ERROR)
    public Result<Long> getUniqueId() {
        return Result.buildSuc(CodeGenerateUtils.getInstance().genCode());
    }
}