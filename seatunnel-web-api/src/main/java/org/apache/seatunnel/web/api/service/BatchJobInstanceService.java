package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.common.enums.RunMode;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.dto.BaseJobDefinitionCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;

public interface BatchJobInstanceService {

    JobInstanceVO create(Long jobDefineId, RunMode runMode);

    PaginationResult<JobInstanceVO> paging(SeaTunnelJobInstanceDTO dto);

    String buildJobConfig(JobDefinitionSaveCommand dto);

    JobInstanceVO selectById(Long id);

    String getLogContent(Long instanceId);

    boolean existsRunningInstance(Long definitionId);

    void removeAllByDefinitionId(Long definitionId);


    void updateById(JobInstance po);
}