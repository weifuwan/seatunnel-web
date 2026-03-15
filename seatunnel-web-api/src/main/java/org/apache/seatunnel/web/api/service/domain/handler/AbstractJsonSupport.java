package org.apache.seatunnel.web.api.service.domain.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class AbstractJsonSupport {

    protected static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    protected String toJson(Object obj) {
        try {
            return obj == null ? "{}" : OBJECT_MAPPER.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize object to JSON", e);
        }
    }
}