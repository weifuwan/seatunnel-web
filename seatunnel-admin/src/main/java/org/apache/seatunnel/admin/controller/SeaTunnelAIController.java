package org.apache.seatunnel.admin.controller;


import jakarta.annotation.Resource;
import org.apache.seatunnel.admin.service.SeaTunnelAiService;
import org.apache.seatunnel.communal.bean.dto.AiGenerateRequest;
import org.apache.seatunnel.communal.bean.vo.AiGenerateResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class SeaTunnelAIController {

    @Resource
    private SeaTunnelAiService seaTunnelAiService;



    @PostMapping("/generate")
    public AiGenerateResponse generate(@RequestBody AiGenerateRequest request) {
        String json = seaTunnelAiService.generateJson(request.getPrompt());
        return new AiGenerateResponse(json);
    }
}
