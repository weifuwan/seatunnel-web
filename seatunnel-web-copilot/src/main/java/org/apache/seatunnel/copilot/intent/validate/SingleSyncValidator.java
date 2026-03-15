package org.apache.seatunnel.copilot.intent.validate;


import org.apache.seatunnel.copilot.intent.ErrorLevel;
import org.apache.seatunnel.copilot.intent.SingleSyncIntent;
import org.apache.seatunnel.copilot.intent.ValidationError;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class SingleSyncValidator implements IntentValidator<SingleSyncIntent> {

    private static final Pattern TABLE =
            Pattern.compile("^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)?$");

    @Override
    public String supportsIntentType() {
        return "SINGLE_SYNC";
    }

    @Override
    public Class<SingleSyncIntent> targetClass() {
        return SingleSyncIntent.class;
    }

    @Override
    public List<ValidationError> validate(SingleSyncIntent intent) {
        List<ValidationError> errors = new ArrayList<>();

        if (intent.getSource() == null) {
            errors.add(err("SINGLE_SYNC.SOURCE_REQUIRED", "$.source", "source 缺失"));
        } else {
            requireNotBlank(intent.getSource().getDatabase(), "SINGLE_SYNC.SOURCE_DB_REQUIRED", "$.source.database", "source.database 必填", errors);
            requireNotBlank(intent.getSource().getTable(), "SINGLE_SYNC.SOURCE_TABLE_REQUIRED", "$.source.table", "source.table 必填", errors);
            if (intent.getSource().getTable() != null && !TABLE.matcher(intent.getSource().getTable()).matches()) {
                errors.add(err("SINGLE_SYNC.SOURCE_TABLE_INVALID", "$.source.table", "source.table 非法表名"));
            }
        }

        if (intent.getSink() == null) {
            errors.add(err("SINGLE_SYNC.SINK_REQUIRED", "$.sink", "sink 缺失"));
        } else {
            requireNotBlank(intent.getSink().getDatabase(), "SINGLE_SYNC.SINK_DB_REQUIRED", "$.sink.database", "sink.database 必填", errors);
            requireNotBlank(intent.getSink().getTable(), "SINGLE_SYNC.SINK_TABLE_REQUIRED", "$.sink.table", "sink.table 必填", errors);
            if (intent.getSink().getTable() != null && !TABLE.matcher(intent.getSink().getTable()).matches()) {
                errors.add(err("SINGLE_SYNC.SINK_TABLE_INVALID", "$.sink.table", "sink.table 非法表名（例如 users 或 schema.users）"));
            }
        }

        return errors;
    }

    private static void requireNotBlank(String v, String code, String path, String msg, List<ValidationError> errors) {
        if (v == null || v.isBlank()) errors.add(err(code, path, msg));
    }

    private static ValidationError err(String code, String path, String msg) {
        return new ValidationError(code, path, msg, ErrorLevel.ERROR);
    }
}
