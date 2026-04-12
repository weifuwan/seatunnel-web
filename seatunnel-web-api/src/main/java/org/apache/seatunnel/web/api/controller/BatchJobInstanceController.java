package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.exceptions.ApiException;
import org.apache.seatunnel.web.api.service.JobInstanceService;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static org.apache.seatunnel.web.spi.enums.Status.BATCH_JOB_INSTANCE_NOT_EXIST;
import static org.apache.seatunnel.web.spi.enums.Status.QUERY_BATCH_JOB_INSTANCE_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.QUERY_BATCH_JOB_INSTANCE_LOG_ERROR;

/**
 * Batch Job Instance Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/job/batch-instance")
@Validated
@Tag(name = "BATCH_JOB_INSTANCE_TAG")
public class BatchJobInstanceController {

    @Resource
    private JobInstanceService seatunnelJobInstanceService;

    /**
     * Performs pagination query for batch job instances.
     */
    @PostMapping("/page")
    @Operation(summary = "queryBatchJobInstancePaging", description = "QUERY_BATCH_JOB_INSTANCE_PAGING_NOTES")
    @ApiException(QUERY_BATCH_JOB_INSTANCE_ERROR)
    public PaginationResult<JobInstanceVO> paging(@RequestBody SeaTunnelJobInstanceDTO dto) {
        return seatunnelJobInstanceService.paging(dto);
    }

    /**
     * Retrieves batch job instance details by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "selectBatchJobInstanceById", description = "SELECT_BATCH_JOB_INSTANCE_BY_ID_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(BATCH_JOB_INSTANCE_NOT_EXIST)
    public Result<JobInstanceVO> selectById(
            @PathVariable("id") @NotNull Long id) {
        return Result.buildSuc(seatunnelJobInstanceService.selectById(id));
    }

    /**
     * Retrieves execution log content by batch job instance ID.
     */
    @GetMapping("/{instanceId}/log")
    @Operation(summary = "queryBatchJobInstanceLog", description = "QUERY_BATCH_JOB_INSTANCE_LOG_NOTES")
    @Parameters({
            @Parameter(name = "instanceId", description = "BATCH_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(QUERY_BATCH_JOB_INSTANCE_LOG_ERROR)
    public Result<String> getLog(@PathVariable("instanceId") Long instanceId) {
        return Result.buildSuc(seatunnelJobInstanceService.getLogContent(instanceId));
    }
}