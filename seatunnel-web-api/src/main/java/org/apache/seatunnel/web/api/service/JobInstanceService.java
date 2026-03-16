package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;

public interface JobInstanceService {

    JobInstanceVO create(Long jobDefineId, RunMode runMode);

    PaginationResult<JobInstanceVO> paging(SeatunnelJobInstanceDTO dto);

    String buildJobConfig(BaseJobDefinitionCommand dto);

    String buildHoconConfig(BaseJobDefinitionCommand dto);


    JobInstanceVO selectById(Long id);

    String getLogContent(Long instanceId);

    boolean existsRunningInstance(Long definitionId);

    void removeAllByDefinitionId(Long definitionId);

    void reconcileUnfinishedInstanceStatuses();

    void updateById(JobInstance po);
}