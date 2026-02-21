package org.apache.seatunnel.admin.thirdparty.metrics;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.apache.seatunnel.admin.thirdparty.engine.SeaTunnelEngineMetricsExtractor;
import org.apache.seatunnel.communal.bean.entity.Engine;
import org.apache.seatunnel.communal.bean.entity.EngineType;
import org.apache.seatunnel.communal.exception.SeatunnelErrorEnum;
import org.apache.seatunnel.communal.exception.SeatunnelException;

/**
 * Factory for creating engine-specific metrics extractors.
 *
 * <p>
 * This class selects the appropriate {@link IEngineMetricsExtractor}
 * implementation based on the configured engine type.
 * </p>
 *
 * <p>
 * New engine types can be supported by extending this factory.
 * </p>
 */
@Data
@AllArgsConstructor
public class EngineMetricsExtractorFactory {

    /**
     * Engine metadata used to determine extractor implementation.
     */
    private final Engine engine;

    /**
     * Get a metrics extractor implementation for the current engine.
     *
     * @return engine-specific metrics extractor
     * @throws SeatunnelException if the engine type is not supported
     */
    public IEngineMetricsExtractor getEngineMetricsExtractor() {
        if (engine.getName() == EngineType.SeaTunnel) {
            return SeaTunnelEngineMetricsExtractor.getInstance();
        }

        // Unsupported engine type
        throw new SeatunnelException(
                SeatunnelErrorEnum.UNSUPPORTED_ENGINE,
                engine.getName(),
                engine.getVersion()
        );
    }
}
