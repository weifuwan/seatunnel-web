package org.apache.seatunnel.web.api.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.web.common.bean.po.SeatunnelJobSchedulePO;

@Mapper
public interface TaskScheduleMapper extends BaseMapper<SeatunnelJobSchedulePO> {

}
