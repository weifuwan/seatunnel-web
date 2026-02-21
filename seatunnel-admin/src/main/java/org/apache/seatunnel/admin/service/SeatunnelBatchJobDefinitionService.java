package org.apache.seatunnel.admin.service;


import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.SeatunnelBatchJobDefinitionPO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;

/**
 * Service interface for managing SeaTunnel job definitions.
 * <p>
 * Provides CRUD operations, pagination queries, and configuration generation
 * for SeaTunnel job definitions.
 */
public interface SeatunnelBatchJobDefinitionService extends IService<SeatunnelBatchJobDefinitionPO> {

    /**
     * Create a new SeaTunnel job definition.
     *
     * @param dto job definition data transfer object
     * @return the ID of the newly created job definition
     */
    Long saveOrUpdate(SeatunnelBatchJobDefinitionDTO dto);

    /**
     * Query a SeaTunnel job definition by its ID.
     *
     * @param id job definition ID
     * @return job definition view object
     */
    SeatunnelBatchJobDefinitionVO selectById(Long id);

    /**
     * Query job definitions with pagination support.
     *
     * @param dto query conditions and pagination parameters
     * @return paginated result of job definition view objects
     */
    PaginationResult<SeatunnelBatchJobDefinitionVO> paging(SeatunnelBatchJobDefinitionDTO dto);

    /**
     * Delete a SeaTunnel job definition by ID.
     *
     * @param id job definition ID
     * @return true if deletion is successful, false otherwise
     */
    Boolean delete(Long id);

    /**
     * Build a HOCON configuration string for a SeaTunnel job.
     *
     * @param dto job definition data
     * @return generated HOCON configuration content
     */
    String buildHoconConfig(SeatunnelBatchJobDefinitionDTO dto);
}
