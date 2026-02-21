package org.apache.seatunnel.admin.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobInstancePO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelJobInstanceVO;

@Mapper
public interface SeatunnelJobInstanceMapper extends BaseMapper<SeatunnelJobInstancePO> {
    IPage<SeatunnelJobInstanceVO> pageWithDefinition(
            Page<?> page,
            @Param("dto") SeatunnelJobInstanceDTO dto);

}
