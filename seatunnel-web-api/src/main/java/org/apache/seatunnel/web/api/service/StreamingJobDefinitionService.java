package org.apache.seatunnel.web.api.service;


import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.apache.seatunnel.web.spi.bean.vo.SeatunnelStreamJobDefinitionVO;

public interface StreamingJobDefinitionService {
    Long saveOrUpdate(SeatunnelStreamingJobDefinitionDTO dto);

    SeatunnelStreamJobDefinitionVO selectById(Long id);

    PaginationResult<SeatunnelStreamJobDefinitionVO> paging(StreamingJobDefinitionQueryDTO dto);

    Boolean delete(Long id);

    String buildHoconConfig(SeatunnelStreamJobDefinitionDTO dto);
}
