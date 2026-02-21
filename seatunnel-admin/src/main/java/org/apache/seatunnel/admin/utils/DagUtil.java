package org.apache.seatunnel.admin.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.seatunnel.admin.dag.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Utility class for parsing and validating DAG definitions.
 * <p>
 * Provides methods to:
 * <ul>
 *   <li>Parse DAG JSON definitions</li>
 *   <li>Execute a chain of {@link DagValidator}s</li>
 *   <li>Return validated {@link DagGraph} objects</li>
 * </ul>
 */
public final class DagUtil {

    private static final Logger log = LoggerFactory.getLogger(DagUtil.class);

    /**
     * Default immutable validator chain applied to DAG validation.
     */
    private static final List<DagValidator> DEFAULT_VALIDATORS =
            Collections.unmodifiableList(Arrays.asList(
                    new IsolatedNodeValidator(),
                    new GraphConnectivityValidator(),
                    new CycleDetectionValidator(),
                    new TransformSingleConnectionValidator()
            ));

    private DagUtil() {
        // Prevent instantiation
    }

    /**
     * Parse and validate a DAG JSON string using the default validators.
     *
     * @param json DAG definition in JSON format
     * @return validated {@link DagGraph}
     * @throws DagValidationException if validation fails
     */
    public static DagGraph parseAndCheck(String json) throws DagValidationException {
        return parseAndCheck(json, DEFAULT_VALIDATORS);
    }

    /**
     * Parse and validate a DAG JSON string using the specified validators.
     *
     * @param json       DAG definition in JSON format
     * @param validators list of validators to apply
     * @return validated {@link DagGraph}
     * @throws DagValidationException if validation fails
     */
    public static DagGraph parseAndCheck(String json, List<DagValidator> validators) throws DagValidationException {
        DagCheckResult result = checkOnly(json, validators);

        if (!result.isValid()) {
            StringBuilder errorMsg = new StringBuilder("DAG validation failed:\n");
            result.getErrors().forEach(error -> errorMsg.append("- ").append(error).append("\n"));
            throw new DagValidationException(errorMsg.toString());
        }

        // Log warnings if any
        result.getWarnings().forEach(warning -> log.warn("DAG warning: {}", warning));

        // Build validated DAG graph
        JSONObject dagJson = JSON.parseObject(json);
        DagGraph graph = new DagGraph();
        graph.setNodes(jsonArrayToList(dagJson.getJSONArray("nodes")));
        graph.setEdges(jsonArrayToList(dagJson.getJSONArray("edges")));
        return graph;
    }

    /**
     * Validate a DAG JSON string and return the validation result only using default validators.
     *
     * @param json DAG definition in JSON format
     * @return validation result
     */
    public static DagCheckResult checkOnly(String json) {
        return checkOnly(json, DEFAULT_VALIDATORS);
    }

    /**
     * Validate a DAG JSON string using the specified validators
     * and return the validation result only.
     *
     * @param json       DAG definition in JSON format
     * @param validators list of validators to apply
     * @return validation result
     */
    public static DagCheckResult checkOnly(String json, List<DagValidator> validators) {
        try {
            JSONObject dagJson = JSON.parseObject(json);
            List<JSONObject> nodes = jsonArrayToList(dagJson.getJSONArray("nodes"));
            List<JSONObject> edges = jsonArrayToList(dagJson.getJSONArray("edges"));
            return performValidation(nodes, edges, validators);
        } catch (Exception e) {
            DagCheckResult result = new DagCheckResult();
            result.addError("Failed to parse DAG JSON: " + e.getMessage());
            return result;
        }
    }

    /**
     * Execute the given validators against the provided nodes and edges.
     *
     * @param nodes      list of node definitions
     * @param edges      list of edge definitions
     * @param validators list of validators to execute
     * @return validation result
     */
    private static DagCheckResult performValidation(
            List<JSONObject> nodes,
            List<JSONObject> edges,
            List<DagValidator> validators) {

        DagCheckResult result = new DagCheckResult();
        result.setValid(true);

        if (validators == null || validators.isEmpty()) {
            return result;
        }

        for (DagValidator validator : validators) {
            // Fail-fast if an error already exists
            if (!result.isValid()) break;

            try {
                validator.validate(nodes, edges, result);
            } catch (Exception e) {
                result.addError("Validator execution failed: " + e.getMessage());
                log.error("Validator {} failed: {}", validator.getClass().getSimpleName(), e.getMessage(), e);
            }
        }

        return result;
    }

    /**
     * Helper method to convert JSONArray to List<JSONObject>.
     *
     * @param array input JSONArray
     * @return List of JSONObjects
     */
    private static List<JSONObject> jsonArrayToList(JSONArray array) {
        return array.toJavaList(JSONObject.class);
    }

    /**
     * Custom exception to distinguish DAG validation failures.
     */
    public static class DagValidationException extends RuntimeException {
        public DagValidationException(String message) {
            super(message);
        }
    }
}
