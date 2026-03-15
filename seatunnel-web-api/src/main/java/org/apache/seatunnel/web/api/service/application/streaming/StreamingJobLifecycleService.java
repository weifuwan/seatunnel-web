package org.apache.seatunnel.web.api.service.application.streaming;

public interface StreamingJobLifecycleService {
    void deploy(Long jobDefinitionId);

    void start(Long jobDefinitionId);

    void stop(Long jobDefinitionId);

    void restart(Long jobDefinitionId);

    void validateCanUpdate(Long jobDefinitionId);

    void validateCanDelete(Long jobDefinitionId);
}
