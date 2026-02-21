package org.apache.seatunnel.admin.controller;

import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.constraints.NotNull;

/**
 * Seatunnel Job Instance Controller
 */
@RestController
@RequestMapping("/api/v1/job/batch-instance")
@Validated
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
    public PaginationResult<SeatunnelJobInstanceVO> paging(
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
    public Result<SeatunnelJobInstanceVO> selectById(
            @PathVariable("id") @NotNull Long id) {
        SeatunnelJobInstanceVO jobDefinition = seatunnelJobInstanceService.selectById(id);
        return Result.buildSuc(jobDefinition);
    }

    @GetMapping("/{instanceId}/log")
    public Result<String> getLog(@PathVariable Long instanceId) {
        String logContent = seatunnelJobInstanceService.getLogContent(instanceId);
        return Result.buildSuc(logContent);
    }
}