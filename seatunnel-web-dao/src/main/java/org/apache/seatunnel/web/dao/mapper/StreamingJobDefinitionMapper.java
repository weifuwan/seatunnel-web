package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;

import java.util.List;

@Mapper
public interface StreamingJobDefinitionMapper extends BaseMapper<StreamingJobDefinitionEntity> {
    List<StreamingJobDefinitionVO> selectPageWithLatestInstance(
            @Param("dto") StreamingJobDefinitionQueryDTO dto,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    Long countPage(@Param("dto") StreamingJobDefinitionQueryDTO dto);
}