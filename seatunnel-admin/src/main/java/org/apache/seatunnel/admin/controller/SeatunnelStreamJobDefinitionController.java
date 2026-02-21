package org.apache.seatunnel.admin.controller;

import org.apache.seatunnel.admin.service.SeatunnelStreamJobDefinitionService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.SeatunnelStreamJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * Seatunnel Job Definition Controller
 */
@RestController
@RequestMapping("/api/v1/job/stream-definition")
@Validated
public class SeatunnelStreamJobDefinitionController {

    @Resource
    private SeatunnelStreamJobDefinitionService seatunnelStreamJobDefinitionService;

    @PostMapping("/hocon")
    public Result<String> buildHoconConfig(@Valid @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        return Result.buildSuc(seatunnelStreamJobDefinitionService.buildHoconConfig(dto));
    }

    /**
     * Create a new job definition
     *
     * @param dto Job definition data
     * @return Created job definition ID
     */
    @PostMapping
    public Result<Long> create(@Valid @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        Long id = seatunnelStreamJobDefinitionService.create(dto);
        return Result.buildSuc(id);
    }

    /**
     * Update an existing job definition
     *
     * @param id  Job definition ID
     * @param dto Updated job definition data
     * @return Updated job definition ID
     */
    @PutMapping("/{id}")
    public Result<Long> update(
            @PathVariable("id") @NotNull Long id,
            @Valid @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        Long updatedId = seatunnelStreamJobDefinitionService.update(id, dto);
        return Result.buildSuc(updatedId);
    }

    /**
     * Get job definition by ID
     *
     * @param id Job definition ID
     * @return Job definition details
     */
    @GetMapping("/{id}")
    public Result<SeatunnelStreamJobDefinitionVO> selectById(
            @PathVariable("id") @NotNull Long id) {
        SeatunnelStreamJobDefinitionVO jobDefinition = seatunnelStreamJobDefinitionService.selectById(id);
        return Result.buildSuc(jobDefinition);
    }

    /**
     * Paginate job definitions
     *
     * @param dto Query parameters
     * @return Paginated job definitions
     */
    @PostMapping("/page")
    public PaginationResult<SeatunnelStreamJobDefinitionVO> paging(
            @RequestBody SeatunnelStreamJobDefinitionDTO dto) {
        return seatunnelStreamJobDefinitionService.paging(dto);
    }

    /**
     * Delete job definition
     *
     * @param id Job definition ID
     * @return Delete result
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @PathVariable("id") @NotNull String id) {
        return Result.buildSuc(seatunnelStreamJobDefinitionService.delete(id));
    }
}