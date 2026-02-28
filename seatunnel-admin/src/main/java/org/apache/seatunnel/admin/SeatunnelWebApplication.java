package org.apache.seatunnel.admin;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import org.apache.seatunnel.admin.components.MysqlServerIdInitializer;
import org.apache.seatunnel.admin.init.SeaTunnelWebManager;
import org.apache.seatunnel.plugin.datasource.api.plugin.DataSourceProcessorProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication(scanBasePackages = {"org.apache.seatunnel.*"})
@EnableConfigurationProperties
@EnableScheduling
@EnableAsync(proxyTargetClass = true)
public class SeatunnelWebApplication {


    @Resource
    private MysqlServerIdInitializer mysqlServerIdInitializer;

    @Resource
    private SeaTunnelWebManager seaTunnelWebManager;

    private static final Logger logger = LoggerFactory.getLogger(SeatunnelWebApplication.class);

    public static void main(String[] args) {
        try {
            SpringApplication sa = new SpringApplication(SeatunnelWebApplication.class);
            sa.run(args);
            DataSourceProcessorProvider.initialize();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PostConstruct
    public void initialized() {
        logger.info("start SeaTunnel Web init sql");
        seaTunnelWebManager.initSeaTunnelWeb();
        logger.info("init SeaTunnel Web finished");

        try {
            int parallelismPerJob = 5;
            int maxConcurrentJobs = 10;
            double bufferFactor = 0.1;

            int totalIds = (int) Math.ceil(parallelismPerJob * maxConcurrentJobs * (1 + bufferFactor));
            int min = 5650;
            int max = min + totalIds - 1;

            mysqlServerIdInitializer.initializeRange(min, max);
            logger.info("CDC server-id range initialized: {}-{} (total {} ids)", min, max, totalIds);

        } catch (Exception e) {
            logger.error("Failed to initialize CDC server-id range", e);
        }
    }

}

