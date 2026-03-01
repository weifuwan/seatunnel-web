package org.apache.seatunnel.copilot.intent;

import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rule First → AI Fallback
 */
@Component
public class IntentParser {

    @Resource
    private AiIntentParser aiIntentParser;

    private static final Pattern SYNC_PATTERN =
            Pattern.compile("from \\[(.*?)\\.(.*?)\\] to \\[(.*?)\\]");

    public Intent parse(String input) {

        Intent ruleIntent = tryRuleParse(input);
        if (ruleIntent != null) {
            return ruleIntent;
        }

        return aiIntentParser.parseByAi(input);
    }

    private Intent tryRuleParse(String input) {

        if (input.startsWith("syncCopilot")) {
            Matcher matcher = SYNC_PATTERN.matcher(input);

            if (matcher.find()) {
                SyncIntent intent = new SyncIntent();
                intent.setSourceId(matcher.group(1));
                intent.setSourceTable(matcher.group(2));
                intent.setSinkId(matcher.group(3));
                return intent;
            }
        }

        return null;
    }
}