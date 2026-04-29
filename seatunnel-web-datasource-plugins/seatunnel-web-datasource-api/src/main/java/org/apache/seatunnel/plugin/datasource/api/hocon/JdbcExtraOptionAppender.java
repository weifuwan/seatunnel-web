package org.apache.seatunnel.plugin.datasource.api.hocon;

import com.typesafe.config.Config;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConfigReaders;
import static org.apache.seatunnel.plugin.datasource.api.hocon.JdbcBatchConstants.*;
import java.util.List;
import java.util.Map;


public class JdbcExtraOptionAppender {

    public void append(Config config, Map<String, Object> map) {
        JdbcConfigReaders.appendConfigObject(config, CONFIG, map);
        JdbcConfigReaders.parseParamsArray(config, map);
        appendExtraParams(config, map);
    }

    private void appendExtraParams(Config config, Map<String, Object> map) {
        if (config == null || !config.hasPath(EXTRA_PARAMS)) {
            return;
        }

        List<? extends Config> list = config.getConfigList(EXTRA_PARAMS);
        for (Config item : list) {
            String key = JdbcConfigReaders.getString(item, KEY, "");
            if (StringUtils.isBlank(key)) {
                continue;
            }

            Object value = item.hasPath(VALUE) ? item.getValue(VALUE).unwrapped() : "";
            map.put(key.trim(), value);
        }
    }
}