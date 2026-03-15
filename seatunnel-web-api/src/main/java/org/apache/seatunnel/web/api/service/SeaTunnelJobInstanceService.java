package org.apache.seatunnel.web.api.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.web.common.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.web.common.bean.entity.PaginationResult;
import org.apache.seatunnel.web.common.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelJobInstanceVO;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;

public interface SeaTunnelJobInstanceService extends IService<SeatunnelJobInstancePO> {

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
}