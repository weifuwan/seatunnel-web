package org.apache.seatunnel.web.dao.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.dao.entity.ConnectorParamMetaEntity;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaQueryDTO;

import java.util.List;

public interface ConnectorParamMetaDao extends IDao<ConnectorParamMetaEntity> {

    boolean checkDuplicate(String type, String connectorName, String paramName);

    boolean checkDuplicateExcludeId(String type, String connectorName, String paramName, Long id);

    IPage<ConnectorParamMetaEntity> queryPage(ConnectorParamMetaQueryDTO dto);

    List<ConnectorParamMetaEntity> queryList(String connectorName, String type);
}