package org.apache.seatunnel.copilot.llm;

import org.springframework.ai.chat.model.ChatResponse;

public interface LlmClient {

    ChatResponse call(String userPrompt);

    ChatResponse call(String systemPrompt, String userPrompt);

    ChatResponse call(String systemPrompt,
                      String userPrompt,
                      double temperature,
                      double topP);

    String callRaw(String systemPrompt, String userPrompt);

    String callJson(String systemPrompt, String userPrompt);

}
