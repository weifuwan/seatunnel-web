package org.apache.seatunnel.web.dao.repository.impl;

import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.dao.entity.BatchJobDefinition;
import org.apache.seatunnel.web.dao.mapper.BatchJobDefinitionMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.BatchJobDefinitionDao;
import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BatchJobDefinitionDaoImpl
        extends BaseDao<BatchJobDefinition, BatchJobDefinitionMapper>
        implements BatchJobDefinitionDao {

    @Resource
    private BatchJobDefinitionMapper batchJobDefinitionMapper;

    public BatchJobDefinitionDaoImpl(@NonNull BatchJobDefinitionMapper batchJobDefinitionMapper) {
        super(batchJobDefinitionMapper);
    }

    @Override
    public boolean saveOrUpdate(BatchJobDefinition po) {
        return batchJobDefinitionMapper.insertOrUpdate(po);
    }


    @Override
    public List<BatchJobDefinitionVO> selectPageWithLatestInstance(
            BatchJobDefinitionQueryDTO dto,
            int offset,
            int pageSize
    ) {
        return batchJobDefinitionMapper.selectPageWithLatestInstance(dto, offset, pageSize);
    }

    @Override
    public Long count(BatchJobDefinitionQueryDTO dto) {
        return batchJobDefinitionMapper.selectDefinitionCount(dto.getJobName());
    }
}
