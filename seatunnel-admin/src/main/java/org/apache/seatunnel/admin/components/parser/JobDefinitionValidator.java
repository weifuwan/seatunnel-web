package org.apache.seatunnel.admin.components.parser;


import com.alibaba.fastjson.JSONObject;

public class JobDefinitionValidator {

    public void validate(JSONObject jobJson) {

        if (jobJson == null) {
            throw new IllegalArgumentException("Job definition cannot be null");
        }

        if (!jobJson.containsKey("source")) {
            throw new IllegalArgumentException("Missing source configuration");
        }

        if (!jobJson.containsKey("target")) {
            throw new IllegalArgumentException("Missing target configuration");
        }
    }
}

