package org.apache.seatunnel.copilot.intent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import org.apache.seatunnel.copilot.llm.LlmClient;
import org.springframework.stereotype.Component;

@Component
public class AiIntentParser {

    @Resource
    private LlmClient llmClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Intent parseByAi(String input) {

        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(input);

        String response = llmClient.callJson(systemPrompt, userPrompt);

        return parseWithRetry(systemPrompt, userPrompt, response, 1);
    }

    private Intent parseWithRetry(String systemPrompt,
                                  String userPrompt,
                                  String response,
                                  int retryCount) {

        try {
            JsonNode node = objectMapper.readTree(response);

            String type = node.path("type").asText();

            if ("SYNC".equals(type)) {

                SyncIntent intent = new SyncIntent();
                intent.setSourceId(node.path("sourceId").asText(null));
                intent.setSourceTable(node.path("sourceTable").asText(null));
                intent.setSinkId(node.path("sinkId").asText(null));

                return intent;
            }

            if ("UNKNOWN".equals(type)) {
                throw new IllegalArgumentException("Intent UNKNOWN");
            }

            throw new IllegalArgumentException("Unsupported intent type: " + type);

        } catch (Exception e) {

            if (retryCount <= 0) {
                throw new RuntimeException(
                        "AI intent parse failed after retry. response=" + response, e);
            }

            String repairPrompt = """
                    上一次输出不是合法 JSON 或字段不符合规范。

                    请重新输出合法 JSON。

                    只输出 JSON。
                    不要解释。
                    不要 markdown。
                    """;

            String repairedResponse =
                    llmClient.callJson(systemPrompt, repairPrompt + "\n\n" + userPrompt);

            return parseWithRetry(systemPrompt, userPrompt, repairedResponse, retryCount - 1);
        }
    }

    private String buildSystemPrompt() {
        return """
                你是一个严格的意图解析引擎。

                你的唯一任务：
                将用户输入解析为结构化 JSON。

                =========================
                严格规则：
                =========================

                1. 只输出 JSON
                2. 不允许输出解释
                3. 不允许输出 markdown
                4. 不允许输出代码块
                5. 不允许输出注释
                6. 必须输出一个合法 JSON 对象
                7. JSON 必须可以被 Jackson 直接解析
                8. 如果无法识别意图，输出：
                   {"type":"UNKNOWN"}

                =========================
                支持的意图类型：
                =========================

                SYNC:
                {
                  "type": "SYNC",
                  "sourceId": "string",
                  "sourceTable": "string",
                  "sinkId": "string"
                }

                所有字段必须存在。
                不允许新增字段。
                不允许删除字段。

                =========================
                示例：
                =========================

                输入：
                syncCopilot | Perform a full data synchronization from [mysql.users] to [pg.1234].

                输出：
                {
                  "type": "SYNC",
                  "sourceId": "mysql",
                  "sourceTable": "users",
                  "sinkId": "pg"
                }
                """;
    }

    private String buildUserPrompt(String input) {
        return "用户输入:\n" + input;
    }
}
