package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.dao.entity.JobDefinitionContentEntity;

import java.util.List;

public interface JobDefinitionContentDao extends IDao<JobDefinitionContentEntity> {

    int save(JobDefinitionContentEntity po);

    List<JobDefinitionContentEntity> queryByJobDefinitionId(Long jobDefinitionId);

    JobDefinitionContentEntity queryLatestByJobDefinitionId(Long jobDefinitionId);
}
