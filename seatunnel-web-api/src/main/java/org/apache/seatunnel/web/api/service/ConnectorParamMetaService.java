package org.apache.seatunnel.web.api.service;


import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaUpdateDTO;
import org.apache.seatunnel.web.spi.bean.vo.ConnectorParamMetaVO;

import java.util.List;

public interface ConnectorParamMetaService {

    Long create(ConnectorParamMetaCreateDTO dto);

    boolean updateById(ConnectorParamMetaUpdateDTO dto);

    ConnectorParamMetaVO getById(Long id);

    IPage<ConnectorParamMetaVO> pageQuery(ConnectorParamMetaQueryDTO dto);

    List<ConnectorParamMetaVO> listByConnectorName(String connectorName, String type);

    boolean deleteById(Long id);
}
