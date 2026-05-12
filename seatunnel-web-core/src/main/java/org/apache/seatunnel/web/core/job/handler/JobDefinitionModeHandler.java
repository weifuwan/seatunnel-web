package org.apache.seatunnel.web.core.job.handler;

import org.apache.seatunnel.web.common.enums.JobDefinitionMode;
import org.apache.seatunnel.web.core.job.model.JobDefinitionAnalysisResult;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;

public interface JobDefinitionModeHandler {

    /**
     * 只按定义模式匹配：
     * SCRIPT / GUIDE_SINGLE / GUIDE_MULTI
     */
    boolean supports(JobDefinitionMode mode);

    /**
     * 校验当前模式下的内容。
     */
    void validate(JobDefinitionSaveCommand command);

    /**
     * 分析 source/sink 类型、表名、数据源 ID 等摘要信息。
     */
    JobDefinitionAnalysisResult analyze(JobDefinitionSaveCommand command);

    /**
     * 序列化定义内容。
     *
     * SCRIPT       -> ScriptJobContent JSON
     * GUIDE_SINGLE -> workflow JSON
     * GUIDE_MULTI  -> GuideMultiJobContent JSON
     */
    String serializeDefinition(JobDefinitionSaveCommand command);

    /**
     * 构建 SeaTunnel HOCON。
     */
    String buildHoconConfig(JobDefinitionSaveCommand command);
}