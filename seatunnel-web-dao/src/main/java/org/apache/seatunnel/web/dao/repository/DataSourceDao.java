package org.apache.seatunnel.web.dao.repository;


import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.common.bean.dto.DataSourceDTO;
import org.apache.seatunnel.web.common.enums.ConnStatus;
import org.apache.seatunnel.web.dao.entity.DataSource;

import java.util.List;

public interface DataSourceDao extends IDao<DataSource> {

    boolean checkName(String name);

    boolean checkNameExcludeId(String name, Long id);

    IPage<DataSource> queryPage(DataSourceDTO dto);

    List<DataSource> queryByDbType(String dbType);

    int updateConnStatus(Long id, ConnStatus status);
}
