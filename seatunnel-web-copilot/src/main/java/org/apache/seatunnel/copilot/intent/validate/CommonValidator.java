package org.apache.seatunnel.copilot.intent.validate;


import org.apache.seatunnel.copilot.intent.StructuredIntent;
import org.apache.seatunnel.copilot.intent.ValidationError;

import java.util.List;

public interface CommonValidator {
    List<ValidationError> validate(StructuredIntent structured);
}