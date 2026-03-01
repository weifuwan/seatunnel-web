package org.apache.seatunnel.admin.llm;

import org.springframework.ai.chat.model.ChatResponse;

public interface LlmClient {
    ChatResponse call(String prompt);
}
