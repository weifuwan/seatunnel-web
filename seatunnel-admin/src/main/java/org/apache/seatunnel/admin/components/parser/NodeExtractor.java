package org.apache.seatunnel.admin.components.parser;


import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import java.util.HashSet;
import java.util.Set;

public class NodeExtractor {

    public Set<String> extractNodeTypes(JSONObject jobJson) {

        Set<String> nodeTypes = new HashSet<>();

        JSONArray nodes = jobJson.getJSONArray("nodes");
        if (nodes == null) {
            return nodeTypes;
        }

        for (int i = 0; i < nodes.size(); i++) {
            JSONObject node = nodes.getJSONObject(i);
            if (node != null) {
                String type = node.getString("type");
                if (type != null) {
                    nodeTypes.add(type);
                }
            }
        }

        return nodeTypes;
    }
}

