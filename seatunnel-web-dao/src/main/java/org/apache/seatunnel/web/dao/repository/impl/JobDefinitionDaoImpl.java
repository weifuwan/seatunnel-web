package org.apache.seatunnel.web.dao.repository.impl;

import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.dao.entity.JobDefinitionEntity;
import org.apache.seatunnel.web.dao.mapper.JobDefinitionMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.JobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JobDefinitionDaoImpl
        extends BaseDao<JobDefinitionEntity, JobDefinitionMapper>
        implements JobDefinitionDao {

    @Resource
    private JobDefinitionMapper jobDefinitionMapper;

    public JobDefinitionDaoImpl(@NonNull JobDefinitionMapper jobDefinitionMapper) {
        super(jobDefinitionMapper);
    }

    @Override
    public boolean saveOrUpdate(JobDefinitionEntity po) {
        return jobDefinitionMapper.insertOrUpdate(po);
    }

    @Override
    public List<BatchJobDefinitionVO> selectPageWithLatestInstance(
            BatchJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    ) {
        return jobDefinitionMapper.selectPageWithLatestInstance(dto, offset, pageSize);
    }

    @Override
    public Long count(BatchJobDefinitionQueryDTO dto) {
        return jobDefinitionMapper.selectDefinitionCount(dto);
    }

    public boolean updateReleaseState(Long id, ReleaseState releaseState) {
        if (id == null || releaseState == null) {
            return false;
        }

        JobDefinitionEntity entity = new JobDefinitionEntity();
        entity.setId(id);
        entity.setReleaseState(releaseState);
        entity.initUpdate();

        return this.updateById(entity);
    }
}