package org.apache.seatunnel.copilot.util;


import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class JsonSanitizerUtils {

    private JsonSanitizerUtils() {
    }

    // ```json\n{...}\n``` 或 ```\n{...}\n```
    private static final Pattern FENCED_JSON =
            Pattern.compile("```(?:json)?\\s*(\\{[\\s\\S]*?\\})\\s*```", Pattern.CASE_INSENSITIVE);

    public static String sanitizeToJsonObject(String text) {
        if (text == null) return null;

        String s = text.trim();

        // 1) fenced block
        Matcher m = FENCED_JSON.matcher(s);
        if (m.find()) {
            return m.group(1).trim();
        }

        // 2) naive: substring from first { to last }
        int l = s.indexOf('{');
        int r = s.lastIndexOf('}');
        if (l >= 0 && r > l) {
            return s.substring(l, r + 1).trim();
        }

        // 3) give up
        return s;
    }
}