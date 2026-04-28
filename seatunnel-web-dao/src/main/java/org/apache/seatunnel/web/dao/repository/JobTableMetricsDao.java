package org.apache.seatunnel.web.dao.repository;


import org.apache.seatunnel.web.dao.entity.JobTableMetrics;
import org.apache.seatunnel.web.spi.bean.vo.JobTableMetricsVO;

import java.util.List;

/**
 * DAO for SeaTunnel table level metrics.
 */
public interface JobTableMetricsDao extends IDao<JobTableMetrics> {
    List<JobTableMetricsVO> selectByInstanceId(Long instanceId);

    void deleteByDefinitionId(Long definitionId);
}
