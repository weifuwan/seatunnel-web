package org.apache.seatunnel.copilot.intent.validate;


import org.apache.seatunnel.copilot.intent.Intent;
import org.apache.seatunnel.copilot.intent.ValidationError;

import java.util.List;

public interface IntentValidator<T extends Intent> {
    String supportsIntentType();
    Class<T> targetClass();
    List<ValidationError> validate(T intent);
}