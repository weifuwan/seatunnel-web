package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.SeaTunnelAiService;
import org.apache.seatunnel.web.common.bean.dto.AiGenerateRequest;
import org.apache.seatunnel.copilot.intent.ErrorLevel;
import org.apache.seatunnel.copilot.intent.ParseResponse;
import org.apache.seatunnel.copilot.intent.ValidationError;
import org.apache.seatunnel.copilot.intent.service.IntentParseService;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeaTunnelCopilotAiServiceImpl implements SeaTunnelAiService {

    @Resource
    private IntentParseService intentParseService;


    @Override
    public ChatResponse copilot(AiGenerateRequest aiGenerateRequest) {

        ParseResponse parseResponse = intentParseService.parseAndValidate(aiGenerateRequest);

        System.out.println("parseResponse = " + parseResponse);

        assertValid(parseResponse);

        return null;
    }

    public void assertValid(ParseResponse resp) {

        List<ValidationError> errors = resp.getErrors();
        if (errors != null && !errors.isEmpty()) {
            for (ValidationError error : errors) {
                if (error != null && error.getLevel() == ErrorLevel.ERROR) {
                    throw new RuntimeException(error.getMessage());
                }
            }
        }
    }
}