package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.dao.entity.BatchJobDefinition;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

import java.util.List;

public interface BatchJobDefinitionDao extends IDao<BatchJobDefinition> {


    boolean saveOrUpdate(BatchJobDefinition po);

    List<BatchJobDefinitionVO> selectPageWithLatestInstance(
            BatchJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long count(BatchJobDefinitionQueryDTO dto);
}