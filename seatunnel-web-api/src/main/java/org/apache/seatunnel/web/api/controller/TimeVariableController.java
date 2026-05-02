package org.apache.seatunnel.web.api.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.TimeVariableService;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePreviewReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableSaveReq;
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
    public Result<IPage<TimeVariableVO>> page(@RequestBody TimeVariablePageReq req) {
        return Result.buildSuc(timeVariableService.page(req));
    }

    @PostMapping
    @Operation(summary = "新增时间变量")
    public Result<Long> create(@RequestBody TimeVariableSaveReq req) {
        req.setId(null);
        return Result.buildSuc(timeVariableService.saveOrUpdateVariable(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改时间变量")
    public Result<Long> update(@PathVariable Long id, @RequestBody TimeVariableSaveReq req) {
        req.setId(id);
        return Result.buildSuc(timeVariableService.saveOrUpdateVariable(req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除时间变量")
    public Result<Boolean> delete(@PathVariable Long id) {
        timeVariableService.deleteVariable(id);
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