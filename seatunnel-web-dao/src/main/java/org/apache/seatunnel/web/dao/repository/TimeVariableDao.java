package org.apache.seatunnel.web.dao.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;

import java.util.List;

public interface TimeVariableDao extends IDao<TimeVariable> {

    boolean checkDuplicate(String paramName);

    boolean checkDuplicateExcludeId(String paramName, Long id);

    IPage<TimeVariable> queryPage(TimeVariablePageReq req);

    List<TimeVariable> queryEnabledList();
}