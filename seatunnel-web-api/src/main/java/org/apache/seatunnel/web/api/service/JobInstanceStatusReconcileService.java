package org.apache.seatunnel.web.api.service;

public interface JobInstanceStatusReconcileService {

    void reconcileInstanceStatus(Long instanceId);

    void reconcileUnfinishedInstanceStatuses();
}