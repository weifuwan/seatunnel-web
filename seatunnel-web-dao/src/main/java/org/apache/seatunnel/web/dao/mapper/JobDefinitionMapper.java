package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

import java.util.List;

@Mapper
public interface JobDefinitionMapper extends BaseMapper<JobDefinitionEntity> {
    List<BatchJobDefinitionVO> selectPageWithLatestInstance(
            BatchJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    );

    Long selectDefinitionCount(BatchJobDefinitionQueryDTO dto);
}