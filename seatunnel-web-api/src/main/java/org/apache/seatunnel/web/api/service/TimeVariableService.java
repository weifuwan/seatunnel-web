package org.apache.seatunnel.web.api.service;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePreviewReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableSaveReq;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariablePreviewVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableRenderVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableVO;


public interface TimeVariableService extends IService<TimeVariable> {

    IPage<TimeVariableVO> page(TimeVariablePageReq req);

    Long saveOrUpdateVariable(TimeVariableSaveReq req);

    void deleteVariable(Long id);

    TimeVariablePreviewVO preview(TimeVariablePreviewReq req);

    TimeVariableRenderVO render(TimeVariableRenderReq req);
}
