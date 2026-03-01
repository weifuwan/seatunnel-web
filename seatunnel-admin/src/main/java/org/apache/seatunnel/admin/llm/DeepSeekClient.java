package org.apache.seatunnel.admin.llm;


import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.deepseek.DeepSeekChatModel;
import org.springframework.ai.deepseek.DeepSeekChatOptions;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class DeepSeekClient implements LlmClient {

    private final ChatClient DeepSeekChatClient;

    public DeepSeekClient(DeepSeekChatModel chatModel) {

        this.DeepSeekChatClient = ChatClient.builder(chatModel).defaultAdvisors(MessageChatMemoryAdvisor.builder(MessageWindowChatMemory.builder().build()).build())
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultOptions(DeepSeekChatOptions.builder().temperature(0.7d).topP(0.8d).build()).build();
    }

    @Override
    public ChatResponse call(String prompt) {

        ChatResponse response = this.DeepSeekChatClient.prompt(new Prompt(
                prompt,
                DeepSeekChatOptions.builder().temperature(0.75).build())
        ).call()
                .chatResponse();

        return response;
    }

    private String extractContent(Map response) {
        // Todo
        return response.toString();
    }
}
