package org.apache.seatunnel.web.dao;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableAutoConfiguration
@MapperScan("org.apache.seatunnel.web.dao.mapper")
public class DaoConfiguration {
}
