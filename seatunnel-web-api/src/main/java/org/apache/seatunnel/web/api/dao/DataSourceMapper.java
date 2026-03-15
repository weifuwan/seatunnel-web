package org.apache.seatunnel.web.api.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.web.common.bean.po.DataSourcePO;

@Mapper
public interface DataSourceMapper extends BaseMapper<DataSourcePO> {

}
