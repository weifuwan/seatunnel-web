package org.apache.seatunnel.web.api.controller;


import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.SeaTunnelAiService;
import org.apache.seatunnel.web.common.bean.dto.AiGenerateRequest;
import org.apache.seatunnel.web.common.bean.entity.Result;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/copilot/ai")
public class SeaTunnelAIController {

    @Resource
    private SeaTunnelAiService seaTunnelAiService;

    @PostMapping("/agent")
    public Result<ChatResponse> generate(@RequestBody AiGenerateRequest request) {
        ChatResponse chatResponse = seaTunnelAiService.copilot(request);
        return Result.buildSuc(chatResponse);
    }
}
