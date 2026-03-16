package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.SeatunnelJobInstanceVO;

public interface SeaTunnelJobInstanceService {

    SeatunnelJobInstanceVO create(Long jobDefineId, RunMode runMode);

    SeatunnelJobInstanceVO createAndSubmit(Long jobDefineId, RunMode runMode);

    PaginationResult<SeatunnelJobInstanceVO> paging(SeatunnelJobInstanceDTO dto);

    String buildJobConfig(BaseJobDefinitionCommand dto);

    String buildHoconConfig(BaseJobDefinitionCommand dto);

    String buildHoconConfigByWholeSync(BaseJobDefinitionCommand dto);

    String buildStreamingHoconConfig(BaseJobDefinitionCommand dto);

    SeatunnelJobInstanceVO selectById(Long id);

    String getLogContent(Long instanceId);

    boolean existsRunningInstance(Long definitionId);

    void deleteInstancesByDefinitionId(Long definitionId);

    void deleteMetricsByDefinitionId(Long definitionId);

    void removeAllByDefinitionId(Long definitionId);

    void updateStatus(Long instanceId, JobStatus status);

    void updateStatus(Long instanceId, JobStatus status, String errorMessage);

    void updateStatusAndEngineId(Long instanceId, JobStatus status, String engineJobId);

    void reconcileInstanceStatus(Long instanceId);

    void reconcileUnfinishedInstanceStatuses();

    void updateById(JobInstance po);
}