package org.apache.seatunnel.web.api.service.support;

public interface JobInstanceStatusReconcileService {

    void reconcileInstanceStatus(Long instanceId);

    void reconcileUnfinishedInstanceStatuses();
}