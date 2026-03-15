package org.apache.seatunnel.copilot.intent.parser;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.seatunnel.copilot.intent.StructuredIntent;
import org.apache.seatunnel.copilot.llm.LlmClient;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class IntentStructurer {

    private static final Pattern SINGLE_SYNC_PATTERN =
            Pattern.compile("from\\s*\\[(?<srcDb>[^\\.\\]]+)\\.(?<srcTable>[^\\]]+)\\]\\s*to\\s*\\[(?<sinkDb>[^\\.\\]]+)\\.(?<sinkTable>[^\\]]+)\\]",
                    Pattern.CASE_INSENSITIVE);

    private final ObjectMapper om = new ObjectMapper();
    private final LlmClient llmClient;

    public IntentStructurer(LlmClient llmClient) {
        this.llmClient = llmClient;
    }


    public StructuredIntent structure(String intentType, String prompt) {

        StructuredIntent byRegex = tryRegex(intentType, prompt);
        if (byRegex != null) return byRegex;


        String system = buildSystemPrompt();
        String userPO = buildUserPrompt(intentType, prompt);
        String json = llmClient.callJson(system, userPO);
        json = cleanJsonFence(json);
        try {
            JsonNode node = om.readTree(json);
            String type = node.path("intentType").asText(null);
            return new StructuredIntent(type, node);
        } catch (Exception e) {
            throw new IllegalArgumentException("LLM structured JSON invalid: " + e.getMessage(), e);
        }
    }

    private String cleanJsonFence(String raw) {
        if (raw == null) {
            return null;
        }

        String result = raw.trim();


        if (result.startsWith("```")) {
            int firstNewLine = result.indexOf("\n");
            if (firstNewLine > 0) {
                result = result.substring(firstNewLine + 1);
            }
            int lastFence = result.lastIndexOf("```");
            if (lastFence >= 0) {
                result = result.substring(0, lastFence);
            }
        }

        return result.trim();
    }

    private StructuredIntent tryRegex(String intentType, String prompt) {

        if (!"SINGLE_SYNC".equalsIgnoreCase(intentType)) return null;

        Matcher m = SINGLE_SYNC_PATTERN.matcher(prompt);
        if (!m.find()) return null;

        ObjectNode root = om.createObjectNode();
        root.put("intentType", "SINGLE_SYNC");

        ObjectNode source = root.putObject("source");
        source.put("database", m.group("srcDb").trim());
        source.put("table", m.group("srcTable").trim());

        ObjectNode sink = root.putObject("sink");
        sink.put("database", m.group("sinkDb").trim());
        sink.put("table", m.group("sinkTable").trim());

        return new StructuredIntent("SINGLE_SYNC", root);
    }

    private String buildSystemPrompt() {
        return """
                You are a strict JSON generator. Output MUST be valid JSON only.
                Never add explanations.
                """;
    }

    private String buildUserPrompt(String intentType, String prompt) {
        return """
                Given the user prompt, extract intent fields and output JSON.

                Required output schema:
                {
                  "intentType": "<STRING>",
                  "source": {"database": "<STRING>", "table": "<STRING>"},
                  "sink": {"database": "<STRING>", "table": "<STRING>"}
                }

                intentType (hint): %s
                userPrompt: %s

                Output JSON only.
                """.formatted(intentType, prompt);
    }
}
