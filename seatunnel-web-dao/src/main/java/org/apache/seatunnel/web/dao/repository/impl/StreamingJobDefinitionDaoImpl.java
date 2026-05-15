package org.apache.seatunnel.web.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.dao.mapper.StreamingJobDefinitionMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
public class StreamingJobDefinitionDaoImpl
        extends BaseDao<StreamingJobDefinitionEntity, StreamingJobDefinitionMapper>
        implements StreamingJobDefinitionDao {

    @Resource
    private StreamingJobDefinitionMapper streamingJobDefinitionMapper;

    public StreamingJobDefinitionDaoImpl(@NonNull StreamingJobDefinitionMapper streamingJobDefinitionMapper) {
        super(streamingJobDefinitionMapper);
    }

    @Override
    public StreamingJobDefinitionEntity queryById(Long id) {
        if (id == null) {
            return null;
        }
        return streamingJobDefinitionMapper.selectById(id);
    }

    @Override
    public void saveOrUpdate(StreamingJobDefinitionEntity entity) {
        if (entity == null) {
            return;
        }

        StreamingJobDefinitionEntity existing = entity.getId() == null
                ? null
                : streamingJobDefinitionMapper.selectById(entity.getId());

        if (existing == null) {
            streamingJobDefinitionMapper.insert(entity);
        } else {
            streamingJobDefinitionMapper.updateById(entity);
        }
    }

    @Override
    public boolean deleteById(Long id) {
        if (id == null) {
            return false;
        }
        return streamingJobDefinitionMapper.deleteById(id) > 0;
    }

    @Override
    public boolean updateReleaseState(Long id, ReleaseState releaseState) {
        if (id == null || releaseState == null) {
            return false;
        }

        LambdaUpdateWrapper<StreamingJobDefinitionEntity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(StreamingJobDefinitionEntity::getId, id)
                .set(StreamingJobDefinitionEntity::getReleaseState, releaseState);

        return streamingJobDefinitionMapper.update(null, wrapper) > 0;
    }

    @Override
    public List<StreamingJobDefinitionVO> selectPage(
            StreamingJobDefinitionQueryDTO dto,
            int offset,
            int pageSize) {
        if (offset < 0) {
            offset = 0;
        }
        if (pageSize <= 0) {
            pageSize = 10;
        }

        List<StreamingJobDefinitionVO> records =
                streamingJobDefinitionMapper.selectPageWithLatestInstance(dto, offset, pageSize);

        return records == null ? Collections.emptyList() : records;
    }

    @Override
    public Long count(StreamingJobDefinitionQueryDTO dto) {
        Long count = streamingJobDefinitionMapper.countPage(dto);
        return count == null ? 0L : count;
    }
}