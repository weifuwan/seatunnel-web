package org.apache.seatunnel.admin.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.communal.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.po.SeatunnelBatchJobDefinitionPO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;

import java.util.List;

@Mapper
public interface SeatunnelJobDefinitionMapper extends BaseMapper<SeatunnelBatchJobDefinitionPO> {
    List<SeatunnelBatchJobDefinitionVO> selectPageWithLatestInstance(
            @Param("dto") SeatunnelBatchJobDefinitionDTO dto,
            @Param("offset") Integer offset,
            @Param("pageSize") Integer pageSize
    );


    Long selectDefinitionCount(@Param("jobName") String jobName);

}
