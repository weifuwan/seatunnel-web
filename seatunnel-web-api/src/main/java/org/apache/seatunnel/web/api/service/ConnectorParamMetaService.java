package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaUpdateDTO;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.ConnectorParamMetaVO;

import java.util.List;

public interface ConnectorParamMetaService {

    Long create(ConnectorParamMetaCreateDTO dto);

    Boolean update(Long id, ConnectorParamMetaUpdateDTO dto);

    ConnectorParamMetaVO getById(Long id);

    PaginationResult<ConnectorParamMetaVO> pageQuery(ConnectorParamMetaQueryDTO dto);

    List<ConnectorParamMetaVO> list(String connectorName, String type);

    void delete(Long id);
}