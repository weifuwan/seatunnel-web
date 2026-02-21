package org.apache.seatunnel.admin.dag;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Validator that restricts Transform nodes to a single connection
 * on each side of the graph.
 * <p>
 * Rules:
 * <ul>
 *   <li>A Transform node may have at most one incoming edge (left side)</li>
 *   <li>A Transform node may have at most one outgoing edge (right side)</li>
 * </ul>
 */
public class TransformSingleConnectionValidator implements DagValidator {

    /**
     * Validate that each Transform node has at most one incoming
     * and one outgoing connection.
     *
     * @param nodes  list of node definitions
     * @param edges  list of edge definitions
     * @param result validation result container
     */
    @Override
    public void validate(List<JSONObject> nodes, List<JSONObject> edges, DagCheckResult result) {
        if (nodes == null || nodes.isEmpty() || edges == null || edges.isEmpty()) {
            return;
        }

        // Count incoming edges for each node
        Map<String, Integer> inDegreeMap = new HashMap<>();
        // Count outgoing edges for each node
        Map<String, Integer> outDegreeMap = new HashMap<>();

        for (JSONObject edge : edges) {
            String source = edge.getString("source");
            String target = edge.getString("target");

            if (StringUtils.isNotBlank(source)) {
                outDegreeMap.put(source, outDegreeMap.getOrDefault(source, 0) + 1);
            }
            if (StringUtils.isNotBlank(target)) {
                inDegreeMap.put(target, inDegreeMap.getOrDefault(target, 0) + 1);
            }
        }

        // Validate Transform nodes only
        for (JSONObject node : nodes) {
            if (!isTransformNode(node)) {
                continue;
            }

            String nodeId = node.getString("id");
            JSONObject data = node.getJSONObject("data");
            String nodeName = data.getString("title");

            int inDegree = inDegreeMap.getOrDefault(nodeId, 0);
            int outDegree = outDegreeMap.getOrDefault(nodeId, 0);

            if (inDegree > 1) {
                result.addError(
                        String.format(
                                "Transform node has more than one incoming connection (left side): ID=%s, Name=%s",
                                nodeId,
                                defaultName(nodeName)
                        )
                );
            }

            if (outDegree > 1) {
                result.addError(
                        String.format(
                                "Transform node has more than one outgoing connection (right side): ID=%s, Name=%s",
                                nodeId,
                                defaultName(nodeName)
                        )
                );
            }
        }
    }

    /**
     * Determine whether the given node is a Transform node.
     *
     * @param node node definition
     * @return true if the node is a Transform node
     */
    private boolean isTransformNode(JSONObject node) {
        JSONObject data = node.getJSONObject("data");
        return "transform".equalsIgnoreCase(data.getString("nodeType"));
    }

    /**
     * Provide a default display name when node name is missing.
     *
     * @param name node name
     * @return node name or placeholder text
     */
    private String defaultName(String name) {
        return StringUtils.isNotBlank(name) ? name : "N/A";
    }
}
