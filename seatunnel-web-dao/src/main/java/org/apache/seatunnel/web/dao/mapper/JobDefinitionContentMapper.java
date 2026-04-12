package org.apache.seatunnel.web.dao.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;

import java.util.List;

@Mapper
public interface JobDefinitionContentMapper extends BaseMapper<JobDefinitionContentEntity> {

}
