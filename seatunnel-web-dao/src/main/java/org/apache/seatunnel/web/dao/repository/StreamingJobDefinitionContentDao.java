package org.apache.seatunnel.web.dao.repository;

import org.apache.seatunnel.web.dao.entity.StreamingJobDefinitionContentEntity;

public interface StreamingJobDefinitionContentDao {

    void save(StreamingJobDefinitionContentEntity entity);

    StreamingJobDefinitionContentEntity queryLatestByJobDefinitionId(Long jobDefinitionId);

    void deleteByJobDefinitionId(Long jobDefinitionId);
}