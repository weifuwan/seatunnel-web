package org.apache.seatunnel.admin.llm;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class DeepSeekClient implements LlmClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String API_URL = "http://deepseek-api/v1/chat/completions";

    @Override
    public String call(String prompt) {

        Map<String, Object> body = new HashMap<>();
        body.put("model", "deepseek-chat");
        body.put("messages", new Object[]{
                Map.of("role", "user", "content", prompt)
        });

        Map response = restTemplate.postForObject(API_URL, body, Map.class);

        return extractContent(response);
    }

    private String extractContent(Map response) {
        // Todo
        return response.toString();
    }
}