package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.exceptions.ApiException;
import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static org.apache.seatunnel.web.spi.enums.Status.DELETE_BATCH_JOB_DEFINITION_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.GET_BATCH_JOB_UNIQUE_ID_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.QUERY_BATCH_JOB_DEFINITION_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR;

@Slf4j
@RestController
@Validated
@Tag(name = "STREAMING_JOB_DEFINITION_TAG")
@RequestMapping("/api/v1/job/streaming-definition")
public class StreamingJobDefinitionController {

    @Resource
    private StreamingJobDefinitionService streamingJobDefinitionService;

    /**
     * 保存或更新 SCRIPT 模式实时任务
     */
    @PostMapping("/script/saveOrUpdate")
    @Operation(summary = "saveOrUpdateStreamingScriptJobDefinition", description = "保存或更新 SCRIPT 模式实时任务")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveScript(@RequestBody StreamingScriptJobSaveCommand command) {
        return Result.buildSuc(streamingJobDefinitionService.saveOrUpdate(command));
    }

    /**
     * 预览生成 SCRIPT 模式实时任务 HOCON 配置
     */
    @PostMapping("/script/build-config")
    @Operation(summary = "buildStreamingScriptJobHoconConfig", description = "预览生成 SCRIPT 模式实时任务 HOCON 配置")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<String> buildScriptConfig(@RequestBody StreamingScriptJobSaveCommand command) {
        return Result.buildSuc(streamingJobDefinitionService.buildHoconConfig(command));
    }

    /**
     * 保存或更新 GUIDE_SINGLE 模式实时任务
     */
    @PostMapping("/guide-single/saveOrUpdate")
    @Operation(summary = "saveOrUpdateStreamingGuideSingleJobDefinition", description = "保存或更新 GUIDE_SINGLE 模式实时任务")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveGuideSingle(@RequestBody StreamingGuideSingleJobSaveCommand command) {
        return Result.buildSuc(streamingJobDefinitionService.saveOrUpdate(command));
    }

    /**
     * 预览生成 GUIDE_SINGLE 模式实时任务 HOCON 配置
     */
    @PostMapping("/guide-single/build-config")
    @Operation(summary = "buildStreamingGuideSingleJobHoconConfig", description = "预览生成 GUIDE_SINGLE 模式实时任务 HOCON 配置")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<String> buildGuideSingleConfig(@RequestBody StreamingGuideSingleJobSaveCommand command) {
        return Result.buildSuc(streamingJobDefinitionService.buildHoconConfig(command));
    }

    /**
     * 保存或更新 GUIDE_MULTI 模式实时任务
     */
    @PostMapping("/guide-multi/saveOrUpdate")
    @Operation(summary = "saveOrUpdateStreamingGuideMultiJobDefinition", description = "保存或更新 GUIDE_MULTI 模式实时任务")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveGuideMulti(@RequestBody StreamingGuideMultiJobSaveCommand command) {
        return Result.buildSuc(streamingJobDefinitionService.saveOrUpdate(command));
    }

    /**
     * 预览生成 GUIDE_MULTI 模式实时任务 HOCON 配置
     */
    @PostMapping("/guide-multi/build-config")
    @Operation(summary = "buildStreamingGuideMultiJobHoconConfig", description = "预览生成 GUIDE_MULTI 模式实时任务 HOCON 配置")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<String> buildGuideMultiConfig(@RequestBody StreamingGuideMultiJobSaveCommand command) {
        return Result.buildSuc(streamingJobDefinitionService.buildHoconConfig(command));
    }

    /**
     * 根据 ID 查询实时任务定义详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "selectStreamingJobDefinitionById", description = "根据 ID 查询实时任务定义详情")
    @Parameters({
            @Parameter(name = "id", description = "实时任务定义 ID", required = true)
    })
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<StreamingJobDefinitionVO> selectById(@PathVariable("id") Long id) {
        return Result.buildSuc(streamingJobDefinitionService.selectById(id));
    }

    /**
     * 分页查询实时任务定义
     */
    @PostMapping("/page")
    @Operation(summary = "queryStreamingJobDefinitionPaging", description = "分页查询实时任务定义")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public PaginationResult<StreamingJobDefinitionVO> paging(@RequestBody StreamingJobDefinitionQueryDTO dto) {
        return streamingJobDefinitionService.paging(dto);
    }

    /**
     * 删除实时任务定义
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "deleteStreamingJobDefinition", description = "删除实时任务定义")
    @Parameters({
            @Parameter(name = "id", description = "实时任务定义 ID", required = true)
    })
    @ApiException(DELETE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> delete(@PathVariable("id") Long id) {
        return Result.buildSuc(streamingJobDefinitionService.delete(id));
    }

    /**
     * 生成唯一 ID
     */
    @GetMapping("/get-unique-id")
    @Operation(summary = "getStreamingJobUniqueId", description = "生成实时任务唯一 ID")
    @ApiException(GET_BATCH_JOB_UNIQUE_ID_ERROR)
    public Result<Long> getUniqueId() {
        return Result.buildSuc(CodeGenerateUtils.getInstance().genCode());
    }

    /**
     * 查询实时任务编辑详情
     */
    @GetMapping("/{id}/edit-detail")
    @Operation(summary = "selectStreamingJobEditDetail", description = "查询实时任务编辑详情")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<?> selectEditDetail(@PathVariable("id") Long id) {
        return Result.buildSuc(streamingJobDefinitionService.selectEditDetail(id));
    }

    /**
     * 上线实时任务定义
     */
    @PutMapping("/{id}/online")
    @Operation(summary = "onlineStreamingJobDefinition", description = "上线实时任务定义")
    @Parameters({
            @Parameter(name = "id", description = "实时任务定义 ID", required = true)
    })
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> online(@PathVariable("id") Long id) {
        return Result.buildSuc(streamingJobDefinitionService.updateReleaseState(id, ReleaseState.ONLINE));
    }

    /**
     * 下线实时任务定义
     */
    @PutMapping("/{id}/offline")
    @Operation(summary = "offlineStreamingJobDefinition", description = "下线实时任务定义")
    @Parameters({
            @Parameter(name = "id", description = "实时任务定义 ID", required = true)
    })
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> offline(@PathVariable("id") Long id) {
        return Result.buildSuc(streamingJobDefinitionService.updateReleaseState(id, ReleaseState.OFFLINE));
    }
}