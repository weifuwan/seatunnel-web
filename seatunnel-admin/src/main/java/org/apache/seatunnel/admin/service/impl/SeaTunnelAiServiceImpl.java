package org.apache.seatunnel.admin.service.impl;

import jakarta.annotation.Resource;
import org.apache.seatunnel.admin.llm.LlmClient;
import org.apache.seatunnel.admin.service.SeaTunnelAiService;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;

@Service
public class SeaTunnelAiServiceImpl implements SeaTunnelAiService {

    @Resource
    private LlmClient llmClient;

    @Override
    public ChatResponse generateJson(String prompt) {

        String finalPrompt = buildPrompt(prompt);

        return llmClient.call(finalPrompt);
    }

    private String buildPrompt(String userPrompt) {
        return """
                你是一个 Seatunnel 任务 JSON 生成器。
                     
                     你的任务：
                     根据用户需求，生成一个用于画布渲染的 JSON。
                     
                     严格遵守以下规则：
                     
                     1. 只输出 JSON
                     2. 不要输出解释
                     3. 不要输出 markdown
                     4. 不要输出代码块
                     5. JSON 必须是一个标准的 JSON 对象
                     6. JSON 必须可被 Jackson / fastjson 直接解析
                     7. 不允许输出注释
                     8. 不允许输出多余文本
                     
                     JSON 结构格式示例（仅示例，不是固定值）：
                     
                     {
                       "source": {
                         "type": "JDBC",
                         "dbType": "MYSQL",
                         "table": "user",
                         "params": {}
                       },
                       "sink": {
                         "type": "JDBC",
                         "dbType": "MYSQL",
                         "table": "user_copy",
                         "params": {}
                       }
                     }
                     
                     现在根据以下用户需求生成 JSON：
                     
                     用户需求：
                     {{USER_PROMPT}}
                """ + userPrompt;
    }
}
