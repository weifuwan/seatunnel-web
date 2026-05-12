package org.apache.seatunnel.web.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionEntity;
import org.apache.seatunnel.web.dao.mapper.SeaTunnelClientMapper;
import org.apache.seatunnel.web.dao.mapper.StreamingJobDefinitionMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.StreamingJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class StreamingJobDefinitionDaoImpl extends BaseDao<StreamingJobDefinitionEntity, StreamingJobDefinitionMapper> implements StreamingJobDefinitionDao {

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
    public List<StreamingJobDefinitionVO> selectPage(StreamingJobDefinitionQueryDTO dto, int offset, int pageSize) {
        LambdaQueryWrapper<StreamingJobDefinitionEntity> wrapper = buildQueryWrapper(dto);
        wrapper.orderByDesc(StreamingJobDefinitionEntity::getUpdateTime);

        List<StreamingJobDefinitionEntity> records =
                streamingJobDefinitionMapper.selectList(wrapper.last("LIMIT " + offset + ", " + pageSize));

        if (records == null || records.isEmpty()) {
            return Collections.emptyList();
        }

        return records.stream()
                .map(entity -> ConvertUtil.sourceToTarget(entity, StreamingJobDefinitionVO.class))
                .collect(Collectors.toList());
    }

    @Override
    public Long count(StreamingJobDefinitionQueryDTO dto) {
        return streamingJobDefinitionMapper.selectCount(buildQueryWrapper(dto));
    }

    private LambdaQueryWrapper<StreamingJobDefinitionEntity> buildQueryWrapper(StreamingJobDefinitionQueryDTO dto) {
        LambdaQueryWrapper<StreamingJobDefinitionEntity> wrapper = new LambdaQueryWrapper<>();

        if (dto == null) {
            return wrapper;
        }

        if (StringUtils.isNotBlank(dto.getJobName())) {
            wrapper.like(StreamingJobDefinitionEntity::getJobName, dto.getJobName());
        }
        if (dto.getMode() != null) {
            wrapper.eq(StreamingJobDefinitionEntity::getMode, dto.getMode());
        }
        if (dto.getJobType() != null) {
            wrapper.eq(StreamingJobDefinitionEntity::getJobType, dto.getJobType());
        }
        if (dto.getReleaseState() != null) {
            wrapper.eq(StreamingJobDefinitionEntity::getReleaseState, dto.getReleaseState());
        }
        if (dto.getClientId() != null) {
            wrapper.eq(StreamingJobDefinitionEntity::getClientId, dto.getClientId());
        }
        if (StringUtils.isNotBlank(dto.getSourceType())) {
            wrapper.eq(StreamingJobDefinitionEntity::getSourceType, dto.getSourceType());
        }
        if (StringUtils.isNotBlank(dto.getSinkType())) {
            wrapper.eq(StreamingJobDefinitionEntity::getSinkType, dto.getSinkType());
        }

        return wrapper;
    }
}