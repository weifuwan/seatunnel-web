package org.apache.seatunnel.copilot.prompt.template;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class PromptTemplate {

    private String name;
    private String version;
    private String content;
}