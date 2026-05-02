package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.core.time.TimeVariableRenderService;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePreviewReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableUpdateDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariablePreviewVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableVO;

public interface TimeVariableService{

    Long create(TimeVariableCreateDTO dto);

    Boolean update(Long id, TimeVariableUpdateDTO dto);

    TimeVariableVO getById(Long id);

    PaginationResult<TimeVariableVO> pageQuery(TimeVariablePageReq req);

    void delete(Long id);

    TimeVariablePreviewVO preview(TimeVariablePreviewReq req);
}