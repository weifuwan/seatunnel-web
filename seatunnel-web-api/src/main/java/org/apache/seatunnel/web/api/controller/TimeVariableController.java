package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.TimeVariableService;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePreviewReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableUpdateDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariablePreviewVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableRenderVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableVO;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/time-variable")
@Tag(name = "TIME_VARIABLE_TAG")
public class TimeVariableController {

    @Resource
    private TimeVariableService timeVariableService;

    @PostMapping("/page")
    @Operation(summary = "分页查询时间变量")
    public PaginationResult<TimeVariableVO> page(@RequestBody TimeVariablePageReq req) {
        return timeVariableService.pageQuery(req);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查询时间变量详情")
    public Result<TimeVariableVO> getById(@PathVariable Long id) {
        return Result.buildSuc(timeVariableService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增时间变量")
    public Result<Long> create(@RequestBody TimeVariableCreateDTO dto) {
        return Result.buildSuc(timeVariableService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改时间变量")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody TimeVariableUpdateDTO dto) {
        return Result.buildSuc(timeVariableService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除时间变量")
    public Result<Boolean> delete(@PathVariable Long id) {
        timeVariableService.delete(id);
        return Result.buildSuc(true);
    }

    @PostMapping("/preview")
    @Operation(summary = "预览时间表达式")
    public Result<TimeVariablePreviewVO> preview(@RequestBody TimeVariablePreviewReq req) {
        return Result.buildSuc(timeVariableService.preview(req));
    }

    @PostMapping("/render")
    @Operation(summary = "渲染 HOCON 中的时间变量")
    public Result<TimeVariableRenderVO> render(@RequestBody TimeVariableRenderReq req) {
        return Result.buildSuc(timeVariableService.render(req));
    }
}