package org.apache.seatunnel.admin.controller;

import org.apache.seatunnel.admin.service.SeatunnelBatchJobDefinitionService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.communal.utils.CodeGenerateUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * Seatunnel Job Definition Controller
 */
@RestController
@RequestMapping("/api/v1/job/batch-definition")
@Validated
public class SeatunnelBatchJobDefinitionController {

    @Resource
    private SeatunnelBatchJobDefinitionService seatunnelBatchJobDefinitionService;

    @PostMapping("/hocon")
    public Result<String> buildHoconConfig(@Valid @RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return Result.buildSuc(seatunnelBatchJobDefinitionService.buildHoconConfig(dto));
    }

    /**
     * Create a new job definition
     *
     * @param dto Job definition data
     * @return Created job definition ID
     */
    @PostMapping
    public Result<Long> saveOrUpdate(@Valid @RequestBody SeatunnelBatchJobDefinitionDTO dto) {
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
    public Result<SeatunnelBatchJobDefinitionVO> selectById(
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
    public PaginationResult<SeatunnelBatchJobDefinitionVO> paging(
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
    public Result<Boolean> delete(
            @PathVariable("id") @NotNull Long id) {
        return Result.buildSuc(seatunnelBatchJobDefinitionService.delete(id));
    }

    @GetMapping("/get-unique-id")
    public Result<Long> getUniqueId() {
        return Result.buildSuc(CodeGenerateUtils.getInstance().genCode());
    }
}