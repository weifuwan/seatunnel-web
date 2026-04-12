package org.apache.seatunnel.web.dao.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;

import java.util.Date;

public interface JobInstanceDao extends IDao<JobInstance> {
    IPage<JobInstanceVO> pageWithDefinition(SeaTunnelJobInstanceDTO dto);

    boolean existsRunningInstance(Long definitionId);

    void deleteByDefinitionId(Long definitionId);

    void updateStatus(Long instanceId, JobStatus status, String errorMessage);

    void updateStatusAndEngineId(Long instanceId, JobStatus status, String engineJobId);

    void updateSubmitResult(Long instanceId, Long engineJobId, JobStatus submitStatus, Date submitTime);
}