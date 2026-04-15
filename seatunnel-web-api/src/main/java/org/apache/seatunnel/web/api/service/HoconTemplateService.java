package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.spi.bean.vo.HoconTemplateVO;
import org.apache.seatunnel.web.spi.enums.DbType;

public interface HoconTemplateService {
    HoconTemplateVO getTemplate(
            DbType sourceDbType,
            String sourcePluginName,
            DbType targetDbType,
            String targetPluginName
    );
}
