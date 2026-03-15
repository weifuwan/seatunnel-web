package org.apache.seatunnel.copilot.intent.validate;


import org.apache.seatunnel.copilot.intent.ErrorLevel;
import org.apache.seatunnel.copilot.intent.StructuredIntent;
import org.apache.seatunnel.copilot.intent.ValidationError;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class BasicCommonValidator implements CommonValidator {


    private static final Set<String> SUPPORTED = Set.of("SINGLE_SYNC");

    @Override
    public List<ValidationError> validate(StructuredIntent structured) {
        List<ValidationError> errors = new ArrayList<>();

        if (structured == null) {
            errors.add(new ValidationError("INTENT.STRUCTURE_NULL", "$", "结构化结果为空", ErrorLevel.ERROR));
            return errors;
        }

        if (structured.getIntentType() == null || structured.getIntentType().isBlank()) {
            errors.add(new ValidationError("INTENT.TYPE_MISSING", "$.intentType", "intentType 缺失", ErrorLevel.ERROR));
            return errors;
        }

        if (!SUPPORTED.contains(structured.getIntentType().toUpperCase())) {
            errors.add(new ValidationError("INTENT.TYPE_UNSUPPORTED", "$.intentType",
                    "不支持的 intentType: " + structured.getIntentType(), ErrorLevel.ERROR));
        }

        if (structured.getPayload() == null || structured.getPayload().isNull()) {
            errors.add(new ValidationError("INTENT.PAYLOAD_MISSING", "$", "payload 缺失", ErrorLevel.ERROR));
        }

        return errors;
    }
}
