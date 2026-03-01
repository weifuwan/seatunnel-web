package org.apache.seatunnel.copilot.intent;

import jakarta.annotation.Resource;
import org.apache.seatunnel.copilot.prompt.template.PromptRenderer;
import org.apache.seatunnel.copilot.prompt.template.PromptTemplate;
import org.apache.seatunnel.copilot.prompt.template.PromptTemplateManager;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class IntentRouter {

    @Resource
    private PromptTemplateManager templateManager;

    @Resource
    private PromptRenderer renderer;

    public String buildPrompt(Intent intent) {

        PromptTemplate template =
                templateManager.getTemplate(intent.getType());

        Map<String, String> variables = buildVariables(intent);

        return renderer.render(template.getContent(), variables);
    }

    private Map<String, String> buildVariables(Intent intent) {

        Map<String, String> map = new HashMap<>();

        if (intent instanceof SyncIntent) {
            SyncIntent sync = (SyncIntent) intent;

            map.put("SOURCE_ID", sync.getSourceId());
            map.put("SOURCE_TABLE", sync.getSourceTable());
            map.put("SINK_ID", sync.getSinkId());
        }

        return map;
    }
}
