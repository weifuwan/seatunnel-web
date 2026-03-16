package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Seatunnel Job Definition Controller
 */
@RestController
@RequestMapping("/api/v1/job/batch-definition")
@Validated
@Tag(name = "Batch Job Definition", description = "APIs for managing batch job definitions")
public class BatchJobDefinitionController {

    @Resource
    private BatchJobDefinitionService batchJobDefinitionService;

    @PostMapping("/saveOrUpdate")
    public Result<Long> saveOrUpdate(@RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return Result.buildSuc(batchJobDefinitionService.saveOrUpdate(dto));
    }

    @GetMapping("/{id}")
    public Result<BatchJobDefinitionVO> selectById(@PathVariable Long id) {
        return Result.buildSuc(batchJobDefinitionService.selectById(id));
    }

    @PostMapping("/page")
    public PaginationResult<BatchJobDefinitionVO> paging(
            @RequestBody BatchJobDefinitionQueryDTO dto) {
        return batchJobDefinitionService.paging(dto);
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.buildSuc(batchJobDefinitionService.delete(id));
    }

    @PostMapping("/buildHoconConfig")
    public Result<String> buildHoconConfig(@RequestBody SeatunnelBatchJobDefinitionDTO dto) {
        return Result.buildSuc(batchJobDefinitionService.buildHoconConfig(dto));
    }

    @GetMapping("/get-unique-id")
    public Result<Long> getUniqueId() {
        return Result.buildSuc(CodeGenerateUtils.getInstance().genCode());
    }
}