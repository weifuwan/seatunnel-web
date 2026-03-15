package org.apache.seatunnel.copilot.intent.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.seatunnel.web.common.bean.dto.AiGenerateRequest;
import org.apache.seatunnel.copilot.intent.*;
import org.apache.seatunnel.copilot.intent.parser.IntentStructurer;
import org.apache.seatunnel.copilot.intent.validate.CommonValidator;
import org.apache.seatunnel.copilot.intent.validate.IntentValidator;
import org.apache.seatunnel.copilot.intent.validate.IntentValidatorRegistry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class IntentParseService {

    private final IntentStructurer structurer;
    private final List<CommonValidator> commonValidators;
    private final IntentValidatorRegistry registry;
    private final ObjectMapper om = new ObjectMapper();

    public IntentParseService(IntentStructurer structurer,
                              List<CommonValidator> commonValidators,
                              IntentValidatorRegistry registry) {
        this.structurer = structurer;
        this.commonValidators = commonValidators;
        this.registry = registry;
    }

    public ParseResponse parseAndValidate(AiGenerateRequest req) {
        List<ValidationError> errors = new ArrayList<>();
        StructuredIntent structured = null;
        String raw = null;

        try {
            structured = structurer.structure(req.getIntentType(), req.getPrompt());
            raw = structured.getPayload() == null ? null : structured.getPayload().toString();
        } catch (Exception e) {
            errors.add(new ValidationError("INTENT.STRUCTURE_FAILED", "$",
                    "结构化失败: " + e.getMessage(), ErrorLevel.ERROR));
            return ParseResponse.of(null, errors, raw);
        }

        for (CommonValidator v : commonValidators) {
            errors.addAll(v.validate(structured));
        }
        if (hasFatal(errors)) {
            return ParseResponse.of(null, errors, raw);
        }

        IntentValidator<?> validator = registry.get(structured.getIntentType());
        if (validator == null) {
            errors.add(new ValidationError("INTENT.VALIDATOR_NOT_FOUND", "$.intentType",
                    "未找到 intent 校验器: " + structured.getIntentType(), ErrorLevel.ERROR));
            return ParseResponse.of(null, errors, raw);
        }

        Intent intent = deserialize(structured, validator, errors);
        if (intent == null) return ParseResponse.of(null, errors, raw);

        errors.addAll(runSpecific(validator, intent));

        return ParseResponse.of(intent, errors, raw);
    }

    private Intent deserialize(StructuredIntent structured, IntentValidator<?> validator, List<ValidationError> errors) {
        try {
            return (Intent) om.treeToValue(structured.getPayload(), validator.targetClass());
        } catch (Exception e) {
            errors.add(new ValidationError("INTENT.DESERIALIZE_FAILED", "$",
                    "反序列化失败: " + e.getMessage(), ErrorLevel.ERROR));
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private <T extends Intent> List<ValidationError> runSpecific(IntentValidator<?> validator, Intent intent) {
        IntentValidator<T> v = (IntentValidator<T>) validator;
        return v.validate((T) intent);
    }

    private boolean hasFatal(List<ValidationError> errors) {
        return errors.stream().anyMatch(e -> e.getLevel() == ErrorLevel.ERROR);
    }
}
