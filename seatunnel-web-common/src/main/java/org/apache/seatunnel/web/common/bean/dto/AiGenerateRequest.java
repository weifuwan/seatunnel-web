package org.apache.seatunnel.web.common.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiGenerateRequest {
    private String prompt;
    private String intentType;

    public void setIntentType(String intentType) {
        this.intentType = intentType.toUpperCase();
    }
}
