package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.exceptions.ApiException;
import org.apache.seatunnel.web.api.service.BatchJobExecutorService;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.springframework.web.bind.annotation.*;

import static org.apache.seatunnel.web.spi.enums.Status.JOB_DEFINITION_EXECUTE_ERROR;

@Slf4j
@RestController
@Tag(name = "JOB_EXECUTOR_TAG")
@RequestMapping("/api/v1/executor")
public class BatchJobExecutorController {

    @Resource
    private BatchJobExecutorService jobExecutorService;

    /**
     * Executes a SeaTunnel job by job definition ID.
     */
    @GetMapping("/execute")
    @Operation(summary = "executeJob", description = "EXECUTE_JOB_NOTES")
    @Parameters({
            @Parameter(name = "jobDefineId", description = "JOB_DEFINITION_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> execute(
            @RequestParam("jobDefineId") Long jobDefineId) {
        Long jobInstanceId = jobExecutorService.jobExecute(jobDefineId, RunMode.MANUAL);
        return Result.buildSuc(jobInstanceId);
    }

    /**
     * Pause / stop a running SeaTunnel job instance.
     */
    @GetMapping("/pause")
    @Operation(summary = "pauseJob", description = "PAUSE_JOB_NOTES")
    @Parameters({
            @Parameter(name = "jobInstanceId", description = "JOB_INSTANCE_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> pause(@RequestParam("jobInstanceId") Long jobInstanceId) {
        Long id = jobExecutorService.jobPause(jobInstanceId);
        return Result.buildSuc(id);
    }
}