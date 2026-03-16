package org.apache.seatunnel.web.api.config;

import org.apache.seatunnel.web.engine.client.client.SeatunnelClientProperties;
import org.apache.seatunnel.web.engine.client.client.SeatunnelRestClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(SeatunnelClientProperties.class)
public class SeatunnelClientConfig {

    @Bean
    public RestTemplate seatunnelRestTemplate(SeatunnelClientProperties props) {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(props.getConnectTimeoutMs());
        f.setReadTimeout(props.getReadTimeoutMs());
        return new RestTemplate(f);
    }

    @Bean
    public SeatunnelRestClient seatunnelRestClient(RestTemplate seatunnelRestTemplate,
                                                   SeatunnelClientProperties props) {
        return new SeatunnelRestClient(seatunnelRestTemplate, props.baseApiUrl());
    }
}