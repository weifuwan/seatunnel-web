package org.apache.seatunnel.admin.service.impl;

import jakarta.annotation.Resource;
import org.apache.seatunnel.admin.service.SeaTunnelAiService;
import org.apache.seatunnel.copilot.intent.Intent;
import org.apache.seatunnel.copilot.intent.IntentParser;
import org.apache.seatunnel.copilot.intent.IntentRouter;
import org.apache.seatunnel.copilot.llm.LlmClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;

@Service
public class SeaTunnelCopilotAiServiceImpl implements SeaTunnelAiService {

    @Resource
    private IntentParser intentParser;

    @Resource
    private IntentRouter intentRouter;

    @Resource
    private LlmClient llmClient;

    @Override
    public ChatResponse generateJson(String userInput) {

        Intent intent = intentParser.parse(userInput);

        String finalPrompt = intentRouter.buildPrompt(intent);

        return llmClient.call(finalPrompt);
    }
}