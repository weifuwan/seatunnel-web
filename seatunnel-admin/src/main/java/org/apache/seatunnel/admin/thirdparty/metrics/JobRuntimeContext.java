package org.apache.seatunnel.admin.thirdparty.metrics;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Runtime context information for a SeaTunnel job instance.
 *
 * This object carries the essential metadata required during
 * job execution, monitoring, and result handling.
 */
@Data
@AllArgsConstructor
public class JobRuntimeContext {

    /**
     * Unique identifier of the job instance in the admin system.
     * Used for tracking, monitoring, and persistence.
     */
    private Long instanceId;

    /**
     * Engine-side job identifier.
     * This ID is used to communicate with the SeaTunnel engine
     * for metrics collection and job result querying.
     */
    private String engineId;

    /**
     * Path to the job configuration file.
     * Used when submitting or reloading job execution parameters.
     */
    private String configFile;
}
