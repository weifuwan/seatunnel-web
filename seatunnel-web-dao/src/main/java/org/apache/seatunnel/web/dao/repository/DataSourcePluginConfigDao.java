package org.apache.seatunnel.web.dao.repository;


import org.apache.seatunnel.web.dao.entity.DataSourcePluginConfig;
import org.apache.seatunnel.web.spi.enums.DbType;

public interface DataSourcePluginConfigDao extends IDao<DataSourcePluginConfig> {

    DataSourcePluginConfig queryByPluginType(DbType pluginType);

    boolean existsByPluginType(DbType pluginType);

    int insertPluginConfig(DataSourcePluginConfig entity);
}
