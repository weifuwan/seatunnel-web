package org.apache.seatunnel.web.dao.repository.impl;

import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinition;
import org.apache.seatunnel.web.dao.mapper.StreamingJobDefinitionMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SteamingJobDefinitionDaoImpl
        extends BaseDao<StreamingJobDefinition, StreamingJobDefinitionMapper>
        implements StreamingJobDefinitionDao {

    @Resource
    private StreamingJobDefinitionMapper streamingJobDefinitionMapper;

    public SteamingJobDefinitionDaoImpl(@NonNull StreamingJobDefinitionMapper StreamingJobDefinitionMapper) {
        super(StreamingJobDefinitionMapper);
    }

    @Override
    public boolean saveOrUpdate(StreamingJobDefinition po) {
        return streamingJobDefinitionMapper.insertOrUpdate(po);
    }


    @Override
    public List<StreamingJobDefinitionVO> selectPageWithLatestInstance(
            StreamingJobDefinitionQueryDTO dto,
            int offset,
            int pageSize) {
//        return streamingJobDefinitionMapper.selectPageWithLatestInstance(dto, offset, pageSize);
        return null;
    }

    @Override
    public Long count(StreamingJobDefinitionQueryDTO dto) {
//        return streamingJobDefinitionMapper.selectDefinitionCount(dto.getJobName());
        return null;
    }
}
