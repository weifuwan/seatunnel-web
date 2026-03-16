package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.dao.entity.BatchJobDefinition;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinition;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.apache.seatunnel.web.spi.bean.vo.SeatunnelStreamJobDefinitionVO;

import java.util.List;

public interface StreamingJobDefinitionDao extends IDao<StreamingJobDefinition> {


    boolean saveOrUpdate(StreamingJobDefinition po);

    List<SeatunnelStreamJobDefinitionVO> selectPageWithLatestInstance(
            StreamingJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long count(StreamingJobDefinitionQueryDTO dto);
}