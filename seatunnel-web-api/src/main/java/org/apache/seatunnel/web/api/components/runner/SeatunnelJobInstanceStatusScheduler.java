package org.apache.seatunnel.web.api.components.runner;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.SeaTunnelJobInstanceService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SeatunnelJobInstanceStatusScheduler {

    @Resource
    private SeaTunnelJobInstanceService seatunnelJobInstanceService;

    @Scheduled(fixedDelayString = "${seatunnel.job.status-reconcile-interval-ms:30000}")
    public void scheduledReconcile() {
        try {
            seatunnelJobInstanceService.reconcileUnfinishedInstanceStatuses();
        } catch (Exception e) {
            log.error("Scheduled reconcile job instance status failed", e);
        }
    }
}