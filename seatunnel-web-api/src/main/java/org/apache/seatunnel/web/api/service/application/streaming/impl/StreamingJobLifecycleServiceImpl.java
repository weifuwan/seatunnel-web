package org.apache.seatunnel.web.api.service.application.streaming.impl;


import org.apache.seatunnel.web.api.service.application.streaming.StreamingJobLifecycleService;
import org.springframework.stereotype.Service;

@Service
public class StreamingJobLifecycleServiceImpl implements StreamingJobLifecycleService {

    @Override
    public void deploy(Long jobDefinitionId) {
        // TODO: create runtime deployment
    }

    @Override
    public void start(Long jobDefinitionId) {
        // TODO: start streaming runtime
    }

    @Override
    public void stop(Long jobDefinitionId) {
        // TODO: stop streaming runtime
    }

    @Override
    public void restart(Long jobDefinitionId) {
        stop(jobDefinitionId);
        start(jobDefinitionId);
    }

    @Override
    public void validateCanUpdate(Long jobDefinitionId) {
        // TODO: validate running status before update
    }

    @Override
    public void validateCanDelete(Long jobDefinitionId) {
        // TODO: validate running status before delete
    }
}
