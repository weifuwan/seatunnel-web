package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.web.dao.entity.JobTableMetrics;
import org.apache.seatunnel.web.spi.bean.vo.JobTableMetricsVO;

import java.util.List;

@Mapper
public interface JobTableMetricsMapper extends BaseMapper<JobTableMetrics> {
    List<JobTableMetricsVO> selectByInstanceId(@Param("instanceId") Long instanceId);

    void deleteByDefinitionId(@Param("definitionId") Long definitionId);

}
