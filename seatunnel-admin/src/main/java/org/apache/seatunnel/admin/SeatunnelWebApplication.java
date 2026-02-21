package org.apache.seatunnel.admin;

import org.apache.seatunnel.admin.components.MysqlServerIdInitializer;
import org.apache.seatunnel.plugin.client.api.factory.SeatunnelClientProvider;
import org.apache.seatunnel.plugin.datasource.api.plugin.DataSourceProcessorProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

@SpringBootApplication(scanBasePackages = {"org.apache.seatunnel.*"})
@EnableConfigurationProperties
@EnableScheduling
@EnableAsync(proxyTargetClass = true)
public class SeatunnelWebApplication {


    @Resource
    private MysqlServerIdInitializer mysqlServerIdInitializer;

    private static final Logger logger = LoggerFactory.getLogger(SeatunnelWebApplication.class);

    public static void main(String[] args) {
        try {
            SpringApplication sa = new SpringApplication(SeatunnelWebApplication.class);
            sa.run(args);
            DataSourceProcessorProvider.initialize();
            SeatunnelClientProvider.initialize();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PostConstruct
    public void initialized() {
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

