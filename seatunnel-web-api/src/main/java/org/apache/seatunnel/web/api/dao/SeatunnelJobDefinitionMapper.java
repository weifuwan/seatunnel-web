package org.apache.seatunnel.web.api.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.common.bean.po.SeatunnelBatchJobDefinitionPO;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelBatchJobDefinitionVO;

import java.util.List;

@Mapper
public interface SeatunnelJobDefinitionMapper extends BaseMapper<SeatunnelBatchJobDefinitionPO> {
    List<SeatunnelBatchJobDefinitionVO> selectPageWithLatestInstance(
            @Param("dto") SeatunnelBatchJobDefinitionQueryDTO dto,
            @Param("offset") Integer offset,
            @Param("pageSize") Integer pageSize
    );


    Long selectDefinitionCount(@Param("jobName") String jobName);

}
