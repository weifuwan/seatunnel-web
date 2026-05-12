package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;

@Mapper
public interface StreamingJobDefinitionMapper extends BaseMapper<StreamingJobDefinitionEntity> {
}