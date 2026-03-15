package org.apache.seatunnel.copilot.intent;



import java.util.Collections;
import java.util.List;

public class ParseResponse {

    private Intent intent;
    private List<ValidationError> errors;
    private String rawStructuredJson;
    public ParseResponse() {
    }

    public ParseResponse(Intent intent,
                         List<ValidationError> errors,
                         String rawStructuredJson) {
        this.intent = intent;
        this.errors = errors;
        this.rawStructuredJson = rawStructuredJson;
    }

    public static ParseResponse of(Intent intent,
                                   List<ValidationError> errors,
                                   String raw) {
        if (errors == null) {
            errors = Collections.emptyList();
        }
        return new ParseResponse(intent, errors, raw);
    }

    public Intent getIntent() {
        return intent;
    }

    public void setIntent(Intent intent) {
        this.intent = intent;
    }

    public List<ValidationError> getErrors() {
        return errors;
    }

    public void setErrors(List<ValidationError> errors) {
        this.errors = errors;
    }

    public String getRawStructuredJson() {
        return rawStructuredJson;
    }

    public void setRawStructuredJson(String rawStructuredJson) {
        this.rawStructuredJson = rawStructuredJson;
    }

    @Override
    public String toString() {
        return "ParseResponse{" +
                "intent=" + intent +
                ", errors=" + errors +
                ", rawStructuredJson='" + rawStructuredJson + '\'' +
                '}';
    }
}
