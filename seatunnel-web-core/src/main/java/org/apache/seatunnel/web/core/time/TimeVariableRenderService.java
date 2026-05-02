package org.apache.seatunnel.web.core.time;

import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableRenderVO;

import java.util.List;

public interface TimeVariableRenderService {

    TimeVariableRenderVO render(TimeVariableRenderReq req);

    String renderContent(String content);

    List<TimeVariable> getAllEnabledVariables();
}