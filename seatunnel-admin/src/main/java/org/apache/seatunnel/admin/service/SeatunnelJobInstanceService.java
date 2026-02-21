package org.apache.seatunnel.admin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.communal.bean.dto.BaseSeatunnelJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.communal.enums.RunMode;

/**
 * Service interface for managing Seatunnel job instances.
 * <p>
 * This service is responsible for creating job instances
 * and building execution configurations for jobs.
 */
public interface SeatunnelJobInstanceService extends IService<SeatunnelJobInstancePO> {

    /**
     * Create a new Seatunnel job instance based on a job definition.
     *
     * @param jobDefineId the ID of the job definition
     * @return the created job instance view object
     */
    SeatunnelJobInstanceVO create(Long jobDefineId, RunMode runMode);

    PaginationResult<SeatunnelJobInstanceVO> paging(SeatunnelJobInstanceDTO dto);

    /**
     * Build a HOCON configuration string for a Seatunnel job.
     *
     * @param baseSeatunnelJobDefinitionDTO job definition information (usually in JSON or structured text format)
     * @return the generated HOCON configuration content
     */
    String buildHoconConfig(BaseSeatunnelJobDefinitionDTO baseSeatunnelJobDefinitionDTO);

    /**
     * Build a HOCON configuration string for a Seatunnel job.
     *
     * @param baseSeatunnelJobDefinitionDTO job definition information (usually in JSON or structured text format)
     * @return the generated HOCON configuration content
     */
    String buildHoconConfigByWholeSync(BaseSeatunnelJobDefinitionDTO baseSeatunnelJobDefinitionDTO);

    /**
     * Build a HOCON configuration string for a Seatunnel job.
     *
     * @param baseSeatunnelJobDefinitionDTO job definition information (usually in JSON or structured text format)
     * @return the generated HOCON configuration content
     */
    String buildHoconConfigWithStream(BaseSeatunnelJobDefinitionDTO baseSeatunnelJobDefinitionDTO);

    SeatunnelJobInstanceVO selectById(Long id);

    String getLogContent(Long instanceId);

    boolean existsRunningInstance(Long definitionId);

    void deleteInstancesByDefinitionId(Long definitionId);

    void deleteMetricsByDefinitionId(Long definitionId);

    void removeAllByDefinitionId(Long id);
}
