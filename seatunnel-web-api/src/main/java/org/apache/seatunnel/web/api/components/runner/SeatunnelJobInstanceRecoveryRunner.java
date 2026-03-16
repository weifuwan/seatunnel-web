package org.apache.seatunnel.web.api.components.runner;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.web.api.service.JobInstanceService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SeatunnelJobInstanceRecoveryRunner implements ApplicationRunner {

    @Resource
    private JobInstanceService seatunnelJobInstanceService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Start recovering unfinished job instance statuses...");
        seatunnelJobInstanceService.reconcileUnfinishedInstanceStatuses();
        log.info("Recover unfinished job instance statuses finished.");
    }
}
