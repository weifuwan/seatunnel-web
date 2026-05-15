package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;

import java.util.List;

public interface StreamingJobDefinitionDao extends IDao<StreamingJobDefinitionEntity> {

    StreamingJobDefinitionEntity queryById(Long id);

    void saveOrUpdate(StreamingJobDefinitionEntity entity);

    boolean deleteById(Long id);

    boolean updateReleaseState(Long id, ReleaseState releaseState);

    List<StreamingJobDefinitionVO> selectPage(
            StreamingJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long count(StreamingJobDefinitionQueryDTO dto);
}