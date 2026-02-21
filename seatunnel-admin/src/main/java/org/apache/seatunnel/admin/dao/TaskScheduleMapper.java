package org.apache.seatunnel.admin.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobSchedulePO;

@Mapper
public interface TaskScheduleMapper extends BaseMapper<SeatunnelJobSchedulePO> {

}
