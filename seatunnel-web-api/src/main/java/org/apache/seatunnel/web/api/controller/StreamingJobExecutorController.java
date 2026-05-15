package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.exceptions.ApiException;
import org.apache.seatunnel.web.api.service.StreamingJobExecutorService;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.springframework.web.bind.annotation.*;

import static org.apache.seatunnel.web.spi.enums.Status.JOB_DEFINITION_EXECUTE_ERROR;

@Slf4j
@RestController
@Tag(name = "STREAMING_JOB_EXECUTOR_TAG")
@RequestMapping("/api/v1/streaming-executor")
public class StreamingJobExecutorController {

    @Resource
    private StreamingJobExecutorService streamingJobExecutorService;

    /**
     * Execute a streaming SeaTunnel job by streaming job definition ID.
     */
    @GetMapping("/execute")
    @Operation(summary = "executeStreamingJob", description = "Execute streaming job by definition id")
    @Parameters({
            @Parameter(name = "jobDefineId", description = "STREAMING_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> execute(@RequestParam("jobDefineId") Long jobDefineId) {
        Long jobInstanceId = streamingJobExecutorService.jobExecute(jobDefineId, RunMode.MANUAL);
        return Result.buildSuc(jobInstanceId);
    }

    /**
     * Pause / stop a running streaming SeaTunnel job instance.
     */
    @GetMapping("/pause")
    @Operation(summary = "pauseStreamingJob", description = "Pause streaming job by instance id")
    @Parameters({
            @Parameter(name = "jobInstanceId", description = "STREAMING_JOB_INSTANCE_ID", required = true)
    })
    @ApiException(JOB_DEFINITION_EXECUTE_ERROR)
    public Result<Long> pause(@RequestParam("jobInstanceId") Long jobInstanceId) {
        Long id = streamingJobExecutorService.jobPause(jobInstanceId);
        return Result.buildSuc(id);
    }
}