package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

import java.util.List;

public interface JobDefinitionDao extends IDao<JobDefinitionEntity> {

    boolean saveOrUpdate(JobDefinitionEntity po);

    List<BatchJobDefinitionVO> selectPageWithLatestInstance(
            BatchJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long count(BatchJobDefinitionQueryDTO dto);

    boolean updateReleaseState(Long id, ReleaseState releaseState);
}
