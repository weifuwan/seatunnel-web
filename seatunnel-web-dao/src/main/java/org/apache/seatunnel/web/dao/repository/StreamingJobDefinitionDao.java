package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.dao.entity.StreamingJobDefinition;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;

import java.util.List;

public interface StreamingJobDefinitionDao extends IDao<StreamingJobDefinition> {


    boolean saveOrUpdate(StreamingJobDefinition po);

    List<StreamingJobDefinitionVO> selectPageWithLatestInstance(
            StreamingJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long count(StreamingJobDefinitionQueryDTO dto);
}