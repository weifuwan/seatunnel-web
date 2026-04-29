package org.apache.seatunnel.web.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.exceptions.ApiException;
import org.apache.seatunnel.web.api.service.BatchJobDefinitionService;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.common.utils.CodeGenerateUtils;
import org.apache.seatunnel.web.spi.bean.dto.*;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static org.apache.seatunnel.web.spi.enums.Status.DELETE_BATCH_JOB_DEFINITION_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.GET_BATCH_JOB_UNIQUE_ID_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.QUERY_BATCH_JOB_DEFINITION_ERROR;
import static org.apache.seatunnel.web.spi.enums.Status.SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR;

@Slf4j
@RestController
@Validated
@Tag(name = "BATCH_JOB_DEFINITION_TAG")
@RequestMapping("/api/v1/job/batch-definition")
public class BatchJobDefinitionController {

    @Resource
    private BatchJobDefinitionService batchJobDefinitionService;

    /**
     * 保存或更新 SCRIPT 模式任务
     */
    @PostMapping("/script/saveOrUpdate")
    @Operation(summary = "saveOrUpdateScriptJobDefinition", description = "SAVE_OR_UPDATE_SCRIPT_JOB_DEFINITION_NOTES")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveScript(@RequestBody ScriptJobSaveCommand command) {
        return Result.buildSuc(batchJobDefinitionService.saveOrUpdate(command));
    }

    /**
     * 预览生成 SCRIPT 模式 HOCON 配置
     */
    @PostMapping("/script/build-config")
    @Operation(summary = "buildScriptJobHoconConfig", description = "BUILD_SCRIPT_JOB_HOCON_CONFIG_NOTES")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<String> buildScriptConfig(@RequestBody ScriptJobSaveCommand command) {
        return Result.buildSuc(batchJobDefinitionService.buildHoconConfig(command));
    }

    /**
     * 保存或更新 GUIDE_SINGLE 模式任务
     */
    @PostMapping("/guide-single/saveOrUpdate")
    @Operation(summary = "saveOrUpdateGuideSingleJobDefinition", description = "SAVE_OR_UPDATE_GUIDE_SINGLE_JOB_DEFINITION_NOTES")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveGuideSingle(@RequestBody GuideSingleJobSaveCommand command) {
        return Result.buildSuc(batchJobDefinitionService.saveOrUpdate(command));
    }

    /**
     * 预览生成 GUIDE_SINGLE 模式 HOCON 配置
     */
    @PostMapping("/guide-single/build-config")
    @Operation(summary = "buildGuideSingleJobHoconConfig", description = "BUILD_GUIDE_SINGLE_JOB_HOCON_CONFIG_NOTES")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<String> buildGuideSingleConfig(@RequestBody GuideSingleJobSaveCommand command) {
        return Result.buildSuc(batchJobDefinitionService.buildHoconConfig(command));
    }

    /**
     * 保存或更新 GUIDE_MULTI 模式任务
     */
    @PostMapping("/guide-multi/saveOrUpdate")
    @Operation(summary = "saveOrUpdateGuideMultiJobDefinition", description = "SAVE_OR_UPDATE_GUIDE_MULTI_JOB_DEFINITION_NOTES")
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Long> saveGuideMulti(@RequestBody GuideMultiJobSaveCommand command) {
        return Result.buildSuc(batchJobDefinitionService.saveOrUpdate(command));
    }

    /**
     * 预览生成 GUIDE_MULTI 模式 HOCON 配置
     */
    @PostMapping("/guide-multi/build-config")
    @Operation(summary = "buildGuideMultiJobHoconConfig", description = "BUILD_GUIDE_MULTI_JOB_HOCON_CONFIG_NOTES")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<String> buildGuideMultiConfig(@RequestBody GuideMultiJobSaveCommand command) {
        return Result.buildSuc(batchJobDefinitionService.buildHoconConfig(command));
    }

    /**
     * 根据 ID 查询任务定义详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "selectBatchJobDefinitionById", description = "SELECT_BATCH_JOB_DEFINITION_BY_ID_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public Result<BatchJobDefinitionVO> selectById(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.selectById(id));
    }

    /**
     * 分页查询任务定义
     */
    @PostMapping("/page")
    @Operation(summary = "queryBatchJobDefinitionPaging", description = "QUERY_BATCH_JOB_DEFINITION_PAGING_NOTES")
    @ApiException(QUERY_BATCH_JOB_DEFINITION_ERROR)
    public PaginationResult<BatchJobDefinitionVO> paging(@RequestBody BatchJobDefinitionQueryDTO dto) {
        return batchJobDefinitionService.paging(dto);
    }

    /**
     * 删除任务定义
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "deleteBatchJobDefinition", description = "DELETE_BATCH_JOB_DEFINITION_NOTES")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(DELETE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> delete(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.delete(id));
    }

    /**
     * 生成唯一 ID
     */
    @GetMapping("/get-unique-id")
    @Operation(summary = "getBatchJobUniqueId", description = "GET_BATCH_JOB_UNIQUE_ID_NOTES")
    @ApiException(GET_BATCH_JOB_UNIQUE_ID_ERROR)
    public Result<Long> getUniqueId() {
        return Result.buildSuc(CodeGenerateUtils.getInstance().genCode());
    }

    /**
     * 查询任务编辑详情
     */
    @GetMapping("/{id}/edit-detail")
    @Operation(summary = "查询任务编辑详情")
    public Result<JobDefinitionSaveCommand> selectEditDetail(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.selectEditDetail(id));
    }

    /**
     * 上线任务定义
     */
    @PutMapping("/{id}/online")
    @Operation(summary = "onlineBatchJobDefinition", description = "上线批任务定义")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> online(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.updateReleaseState(id, ReleaseState.ONLINE));
    }

    /**
     * 下线任务定义
     */
    @PutMapping("/{id}/offline")
    @Operation(summary = "offlineBatchJobDefinition", description = "下线批任务定义")
    @Parameters({
            @Parameter(name = "id", description = "BATCH_JOB_DEFINITION_ID", required = true)
    })
    @ApiException(SAVE_OR_UPDATE_BATCH_JOB_DEFINITION_ERROR)
    public Result<Boolean> offline(@PathVariable("id") Long id) {
        return Result.buildSuc(batchJobDefinitionService.updateReleaseState(id, ReleaseState.OFFLINE));
    }
}