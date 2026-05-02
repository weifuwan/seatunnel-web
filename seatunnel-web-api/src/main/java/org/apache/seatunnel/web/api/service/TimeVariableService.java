package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePreviewReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableUpdateDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariablePreviewVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableRenderVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableVO;

import java.util.List;

public interface TimeVariableService {

    Long create(TimeVariableCreateDTO dto);

    Boolean update(Long id, TimeVariableUpdateDTO dto);

    TimeVariableVO getById(Long id);

    PaginationResult<TimeVariableVO> pageQuery(TimeVariablePageReq req);

    void delete(Long id);

    TimeVariablePreviewVO preview(TimeVariablePreviewReq req);

    TimeVariableRenderVO render(TimeVariableRenderReq req);


    List<TimeVariable> getAllEnabledVariables();

}