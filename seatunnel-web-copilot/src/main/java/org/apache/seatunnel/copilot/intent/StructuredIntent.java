package org.apache.seatunnel.copilot.intent;


import com.fasterxml.jackson.databind.JsonNode;

public class StructuredIntent {

    /**
     * 结构化后的 intentType
     */
    private String intentType;

    /**
     * 原始结构化 JSON（完整 payload）
     */
    private JsonNode payload;

    public StructuredIntent() {
    }

    public StructuredIntent(String intentType, JsonNode payload) {
        this.intentType = intentType;
        this.payload = payload;
    }

    public String getIntentType() {
        return intentType;
    }

    public void setIntentType(String intentType) {
        this.intentType = intentType;
    }

    public JsonNode getPayload() {
        return payload;
    }

    public void setPayload(JsonNode payload) {
        this.payload = payload;
    }

    @Override
    public String toString() {
        return "StructuredIntent{" +
                "intentType='" + intentType + '\'' +
                ", payload=" + payload +
                '}';
    }
}