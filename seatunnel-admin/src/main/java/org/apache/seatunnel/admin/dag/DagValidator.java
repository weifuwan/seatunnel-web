package org.apache.seatunnel.admin.dag;

import com.alibaba.fastjson.JSONObject;

import java.util.List;

/**
 * Interface for DAG validation.
 * <p>
 * Implementations of this interface perform specific validation checks
 * on a Directed Acyclic Graph (DAG), such as cycle detection, connectivity
 * validation, or isolated node detection.
 */
public interface DagValidator {

    /**
     * Validate the DAG structure and consistency.
     *
     * @param nodes  list of node definitions in the DAG
     * @param edges  list of edge definitions in the DAG
     * @param result container used to collect validation errors and warnings
     */
    void validate(List<JSONObject> nodes, List<JSONObject> edges, DagCheckResult result);
}
