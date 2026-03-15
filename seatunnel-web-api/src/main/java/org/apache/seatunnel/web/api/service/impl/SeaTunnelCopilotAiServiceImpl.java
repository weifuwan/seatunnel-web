package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import org.apache.seatunnel.copilot.intent.service.IntentParseService;
import org.apache.seatunnel.web.api.service.SeaTunnelAiService;
import org.apache.seatunnel.web.common.bean.dto.AiGenerateRequest;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;

@Service
public class SeaTunnelCopilotAiServiceImpl implements SeaTunnelAiService {

    @Resource
    private IntentParseService intentParseService;


    @Override
    public ChatResponse copilot(AiGenerateRequest aiGenerateRequest) {
        return null;
    }


}