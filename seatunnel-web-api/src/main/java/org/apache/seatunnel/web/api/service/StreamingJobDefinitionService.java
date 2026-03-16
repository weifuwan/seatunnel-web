package org.apache.seatunnel.web.api.service;


import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

public interface StreamingJobDefinitionService {
    Long saveOrUpdate(SeatunnelStreamingJobDefinitionDTO dto);

    BatchJobDefinitionVO selectById(Long id);

    PaginationResult<BatchJobDefinitionVO> paging(BatchJobDefinitionQueryDTO dto);

    Boolean delete(Long id);
}
