package org.apache.seatunnel.copilot.prompt.template;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PromptRenderer {

    public String render(String template, Map<String, String> variables) {

        String result = template;

        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace(
                    "{{" + entry.getKey() + "}}",
                    entry.getValue()
            );
        }

        return result;
    }
}
