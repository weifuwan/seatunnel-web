package org.apache.seatunnel.admin.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;

@Mapper
public interface SeatunnelJobMetricsMapper extends BaseMapper<SeatunnelJobMetricsPO> {
}
