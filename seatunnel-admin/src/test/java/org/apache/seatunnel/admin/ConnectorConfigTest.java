package org.apache.seatunnel.admin;

import com.typesafe.config.*;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class ConnectorConfigTest {

    /* --------------- 被测方法（拷贝自业务代码） --------------- */
    private String getConnectorConfig(Map<String, List<Config>> connectorMap) {
        List<String> configs = new ArrayList<>();
        ConfigRenderOptions configRenderOptions =
                ConfigRenderOptions.defaults()
                        .setJson(false)
                        .setComments(false)
                        .setOriginComments(false);
        for (Map.Entry<String, List<Config>> entry : connectorMap.entrySet()) {
            for (Config c : entry.getValue()) {
                configs.add(
                        ConfigFactory.empty()
                                .withValue(entry.getKey(), c.root())
                                .root()
                                .render(configRenderOptions));
            }
        }
        return StringUtils.join(configs, "\n");
    }

    /* -------------------------- 测试 -------------------------- */

    @Test
    void testSingleConnectorSingleConfig() {
        Map<String, List<Config>> map = new HashMap<>();
        map.put("kafka", Arrays.asList(ConfigFactory.parseString("bootstrap.servers=\"localhost:9092\"\nretries=3")));

        String result = getConnectorConfig(map);
        System.out.println("---- single connector ----\n" + result);

        // 验证只出现一次 kafka 命名空间，且包含我们写的两个字段
        assertEquals(1, result.split("\n").length);
        assertTrue(result.contains("kafka"));
        assertTrue(result.contains("bootstrap.servers"));
        assertTrue(result.contains("retries"));
    }

    @Test
    void testMultiConnectorMultiConfig() {
        Map<String, List<Config>> map = new HashMap<>();
        map.put("kafka", Arrays.asList(
                ConfigFactory.parseString("bootstrap.servers=\"k1:9092,k2:9092\""),
                ConfigFactory.parseString("security.protocol=SASL_SSL")));
        map.put("jdbc", Arrays.asList(
                ConfigFactory.parseString("url=\"jdbc:mysql://127.0.0.1:3306/test\"\nuser=root"),
                ConfigFactory.parseString("pool.size=10")));

        String result = getConnectorConfig(map);
        System.out.println("---- multi connector ----\n" + result);

        // 一共 4 段配置，每段一个顶层 key
        String[] lines = result.split("\n");
        assertEquals(4, lines.length);

        // 简单校验几个字段存在
        assertTrue(result.contains("kafka"));
        assertTrue(result.contains("jdbc"));
        assertTrue(result.contains("bootstrap.servers"));
        assertTrue(result.contains("url"));
    }

    @Test
    void testEmptyMap() {
        String result = getConnectorConfig(new HashMap<>());
        System.out.println("---- empty map ----\n\"" + result + "\"");
        assertEquals("", result);
    }
}
