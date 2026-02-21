package org.apache.seatunnel.admin.controller;

import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.SeatunnelJobExecutorService;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.enums.RunMode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;


@Slf4j
@RestController
@RequestMapping("/api/v1/executor")
public class SeatunnelJobExecutorController {
    @Resource
    private SeatunnelJobExecutorService jobExecutorService;

    /**
     * Execute a SeaTunnel job based on the job definition ID.
     *
     * @param jobDefineId the ID of the job definition
     * @return the job instance ID created after execution
     */
    @GetMapping("/execute")
    public Result<Long> jobExecutor(@RequestParam("jobDefineId") Long jobDefineId) {
        return Result.buildSuc(jobExecutorService.jobExecute(jobDefineId, RunMode.MANUAL));
    }
}
