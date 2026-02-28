package org.apache.seatunnel.admin.llm;

public interface LlmClient {
    String call(String prompt);
}
