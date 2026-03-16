package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.web.dao.entity.BatchJobDefinition;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

import java.util.List;

@Mapper
public interface BatchJobDefinitionMapper extends BaseMapper<BatchJobDefinition> {
    List<BatchJobDefinitionVO> selectPageWithLatestInstance(
            @Param("dto") BatchJobDefinitionQueryDTO dto,
            @Param("offset") Integer offset,
            @Param("pageSize") Integer pageSize
    );


    Long selectDefinitionCount(@Param("jobName") String jobName);

}
