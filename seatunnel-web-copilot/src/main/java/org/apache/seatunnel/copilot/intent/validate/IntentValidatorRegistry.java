package org.apache.seatunnel.copilot.intent.validate;


import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class IntentValidatorRegistry {

    private final Map<String, IntentValidator<?>> registry;

    public IntentValidatorRegistry(List<IntentValidator<?>> validators) {
        this.registry = validators.stream()
                .collect(Collectors.toMap(v -> v.supportsIntentType().toUpperCase(), Function.identity()));
    }

    public IntentValidator<?> get(String intentType) {
        if (intentType == null) return null;
        return registry.get(intentType.toUpperCase());
    }
}
