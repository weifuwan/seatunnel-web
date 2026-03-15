package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.web.dao.entity.BatchJobDefinition;

@Mapper
public interface SeaTunnelJobDefinitionMapper extends BaseMapper<BatchJobDefinition> {
//    List<SeatunnelBatchJobDefinitionVO> selectPageWithLatestInstance(
//            @Param("dto") SeatunnelBatchJobDefinitionQueryDTO dto,
//            @Param("offset") Integer offset,
//            @Param("pageSize") Integer pageSize
//    );
//
//
//    Long selectDefinitionCount(@Param("jobName") String jobName);

}
