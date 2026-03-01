package org.apache.seatunnel.copilot.llm;


import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.deepseek.DeepSeekChatModel;
import org.springframework.ai.deepseek.DeepSeekChatOptions;
import org.springframework.stereotype.Component;

@Component
public class DeepSeekClient implements LlmClient {

    private final ChatClient statelessClient;
    private final ChatClient statefulClient;

    public DeepSeekClient(DeepSeekChatModel chatModel) {

        // 带记忆（默认对话）
        this.statefulClient = ChatClient.builder(chatModel)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(
                                MessageWindowChatMemory.builder().build()
                        ).build()
                )
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultOptions(
                        DeepSeekChatOptions.builder()
                                .temperature(0.7)
                                .topP(0.8)
                                .build()
                )
                .build();

        // 无记忆（结构化输出建议使用）
        this.statelessClient = ChatClient.builder(chatModel)
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultOptions(
                        DeepSeekChatOptions.builder()
                                .temperature(0.0) // 默认低温
                                .topP(1.0)
                                .build()
                )
                .build();
    }

    @Override
    public ChatResponse call(String userPrompt) {
        return statefulClient
                .prompt(userPrompt)
                .call()
                .chatResponse();
    }


    @Override
    public ChatResponse call(String systemPrompt, String userPrompt) {
        return statefulClient
                .prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .chatResponse();
    }

    @Override
    public ChatResponse call(String systemPrompt,
                             String userPrompt,
                             double temperature,
                             double topP) {

        return statefulClient
                .prompt(new Prompt(
                        userPrompt,
                        DeepSeekChatOptions.builder()
                                .temperature(temperature)
                                .topP(topP)
                                .build()
                ))
                .call()
                .chatResponse();
    }

    @Override
    public String callRaw(String systemPrompt, String userPrompt) {

        return statefulClient
                .prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();
    }

    @Override
    public String callJson(String systemPrompt, String userPrompt) {
        return statelessClient
                .prompt(new Prompt(
                        userPrompt,
                        DeepSeekChatOptions.builder()
                                .temperature(0.0)
                                .topP(1.0)
                                .build()
                ))
                .call()
                .content();
    }


}
