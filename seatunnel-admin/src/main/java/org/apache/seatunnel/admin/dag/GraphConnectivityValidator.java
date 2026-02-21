package org.apache.seatunnel.admin.dag;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Validator that checks graph connectivity.
 * <p>
 * This validator ensures that all edges reference existing nodes.
 * If an edge points to a non-existent source or target node,
 * the DAG is considered invalid.
 */
public class GraphConnectivityValidator implements DagValidator {

    /**
     * Validate whether all edges in the DAG reference valid nodes.
     *
     * @param nodes  list of node definitions
     * @param edges  list of edge definitions
     * @param result validation result container
     */
    @Override
    public void validate(List<JSONObject> nodes, List<JSONObject> edges, DagCheckResult result) {
        // If nodes or edges are missing, skip validation
        if (nodes == null || nodes.isEmpty() || edges == null || edges.isEmpty()) {
            return;
        }

        // Collect all existing node IDs
        Set<String> nodeIds = new HashSet<>();
        for (JSONObject node : nodes) {
            String nodeId = node.getString("id");
            if (StringUtils.isNotBlank(nodeId)) {
                nodeIds.add(nodeId);
            }
        }

        // Validate that each edge references existing source and target nodes
        for (JSONObject edge : edges) {
            String sourceId = edge.getString("source");
            String targetId = edge.getString("target");

            // Check whether the source node exists
            if (StringUtils.isNotBlank(sourceId) && !nodeIds.contains(sourceId)) {
                result.addError(
                        String.format("Edge references a non-existent source node: %s", sourceId)
                );
            }

            // Check whether the target node exists
            if (StringUtils.isNotBlank(targetId) && !nodeIds.contains(targetId)) {
                result.addError(
                        String.format("Edge references a non-existent target node: %s", targetId)
                );
            }
        }
    }
}
