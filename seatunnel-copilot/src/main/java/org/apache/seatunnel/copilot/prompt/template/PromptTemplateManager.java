package org.apache.seatunnel.copilot.prompt.template;

import jakarta.annotation.PostConstruct;
import org.apache.seatunnel.copilot.intent.IntentType;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class PromptTemplateManager {

    private final Map<IntentType, PromptTemplate> templateCache = new HashMap<>();

    @PostConstruct
    public void loadTemplates() {

        templateCache.put(IntentType.SYNC,
                new PromptTemplate(
                        "sync_v1",
                        "v1",
                        loadFromFile("prompts/sync_v1.txt")
                ));

        templateCache.put(IntentType.VALIDATE,
                new PromptTemplate(
                        "validate_v1",
                        "v1",
                        loadFromFile("prompts/validate_v1.txt")
                ));
    }

    public PromptTemplate getTemplate(IntentType type) {
        return templateCache.get(type);
    }

    private String loadFromFile(String path) {
        try (InputStream is =
                     getClass().getClassLoader().getResourceAsStream(path)) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Load prompt failed", e);
        }
    }
}
