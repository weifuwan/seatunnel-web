package org.apache.seatunnel.web.dao.repository.impl;

import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.dao.entity.JobTableMetrics;
import org.apache.seatunnel.web.dao.mapper.JobTableMetricsMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.JobTableMetricsDao;
import org.apache.seatunnel.web.spi.bean.vo.JobTableMetricsVO;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
public class JobTableMetricsDaoImpl extends BaseDao<JobTableMetrics, JobTableMetricsMapper>
        implements JobTableMetricsDao {

    @Resource
    private JobTableMetricsMapper jobTableMetricsMapper;

    public JobTableMetricsDaoImpl(@NonNull JobTableMetricsMapper jobTableMetricsMapper) {
        super(jobTableMetricsMapper);
    }

    @Override
    public List<JobTableMetricsVO> selectByInstanceId(Long instanceId) {
        if (instanceId == null || instanceId <= 0) {
            return Collections.emptyList();
        }

        return jobTableMetricsMapper.selectByInstanceId(instanceId);
    }

    @Override
    public void deleteByDefinitionId(Long definitionId) {
        if (definitionId == null || definitionId <= 0) {
            return;
        }

        jobTableMetricsMapper.deleteByDefinitionId(definitionId);
    }
}
