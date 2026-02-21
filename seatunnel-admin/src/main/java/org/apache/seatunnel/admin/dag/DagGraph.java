package org.apache.seatunnel.admin.dag;

import com.alibaba.fastjson.JSONObject;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Represents a DAG graph structure.
 * <p>
 * This class holds node and edge definitions in JSON format
 * and provides utility methods to convert node definitions
 * into Typesafe {@link Config} objects.
 */
@Data
@NoArgsConstructor
public class DagGraph {

    /**
     * List of node definitions represented as JSON objects
     */
    private List<JSONObject> nodes;

    /**
     * List of edge definitions represented as JSON objects
     */
    private List<JSONObject> edges;

    /**
     * Convert all node JSON objects into {@link Config} instances.
     *
     * @return list of node configurations in Typesafe Config format
     */
    public List<Config> getNodesAsConfig() {
        List<Config> configs = new ArrayList<>();

        for (JSONObject node : nodes) {
            Config config = convertJsonObjectToConfig(node);
            configs.add(config);
        }

        return configs;
    }

    /**
     * Convert a {@link JSONObject} into a Typesafe {@link Config}.
     *
     * @param jsonObject node definition in JSON format
     * @return corresponding Typesafe Config object
     */
    private Config convertJsonObjectToConfig(JSONObject jsonObject) {
        Map<String, Object> map = jsonObject.toJavaObject(Map.class);
        return ConfigFactory.parseMap(map);
    }
}
