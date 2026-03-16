package org.apache.seatunnel.web.api.service;


import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.web.dao.entity.StreamJobDefinition;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.SeatunnelStreamJobDefinitionVO;

/**
 * Service interface for managing SeaTunnel job definitions.
 * <p>
 * Provides CRUD operations, pagination queries, and configuration generation
 * for SeaTunnel job definitions.
 */
public interface SeaTunnelStreamJobDefinitionService extends IService<StreamJobDefinition> {

    /**
     * Create a new SeaTunnel job definition.
     *
     * @param dto job definition data transfer object
     * @return the ID of the newly created job definition
     */
    Long create(SeatunnelStreamJobDefinitionDTO dto);

    /**
     * Update an existing SeaTunnel job definition.
     *
     * @param id  the ID of the job definition to update
     * @param dto updated job definition data
     * @return the ID of the updated job definition
     */
    Long update(Long id, SeatunnelStreamJobDefinitionDTO dto);

    /**
     * Query a SeaTunnel job definition by its ID.
     *
     * @param id job definition ID
     * @return job definition view object
     */
    SeatunnelStreamJobDefinitionVO selectById(Long id);

    /**
     * Query job definitions with pagination support.
     *
     * @param dto query conditions and pagination parameters
     * @return paginated result of job definition view objects
     */
    PaginationResult<SeatunnelStreamJobDefinitionVO> paging(SeatunnelStreamJobDefinitionDTO dto);

    /**
     * Delete a SeaTunnel job definition by ID.
     *
     * @param id job definition ID
     * @return true if deletion is successful, false otherwise
     */
    Boolean delete(String id);

    /**
     * Build a HOCON configuration string for a SeaTunnel job.
     *
     * @param dto job definition data
     * @return generated HOCON configuration content
     */
    String buildHoconConfig(SeatunnelStreamJobDefinitionDTO dto);
}
