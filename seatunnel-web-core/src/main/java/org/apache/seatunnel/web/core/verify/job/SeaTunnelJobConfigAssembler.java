package org.apache.seatunnel.web.core.verify.job;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigRenderOptions;
import org.springframework.stereotype.Component;

@Component
public class SeaTunnelJobConfigAssembler {

    public String assemble(Config envConfig,
                           String sourcePluginName,
                           Config sourceConfig,
                           String sinkPluginName,
                           Config sinkConfig) {

        StringBuilder sb = new StringBuilder(256);
        sb.append("env ");
        sb.append(render(envConfig));
        sb.append("\n\n");

        sb.append("source {\n");
        sb.append("  ").append(sourcePluginName).append(" ");
        sb.append(indent(render(sourceConfig), 2));
        sb.append("\n");
        sb.append("}\n\n");

        sb.append("sink {\n");
        sb.append("  ").append(sinkPluginName).append(" ");
        sb.append(indent(render(sinkConfig), 2));
        sb.append("\n");
        sb.append("}\n");

        return sb.toString();
    }

    private String render(Config config) {
        return config.root().render(
                ConfigRenderOptions.defaults()
                        .setOriginComments(false)
                        .setComments(false)
                        .setFormatted(true)
                        .setJson(false)
        );
    }

    private String indent(String text, int spaces) {
        StringBuilder prefixBuilder = new StringBuilder();
        for (int i = 0; i < spaces; i++) {
            prefixBuilder.append(' ');
        }
        String prefix = prefixBuilder.toString();

        String[] lines = text.split("\\r?\\n");
        StringBuilder sb = new StringBuilder(text.length() + lines.length * spaces);
        for (int i = 0; i < lines.length; i++) {
            sb.append(prefix).append(lines[i]);
            if (i < lines.length - 1) {
                sb.append('\n');
            }
        }
        return sb.toString();
    }
}
