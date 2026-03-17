package org.apache.seatunnel.web.api.config;

import org.apache.seatunnel.web.engine.client.rest.SeaTunnelClientProperties;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelClientResolver;
import org.apache.seatunnel.web.engine.client.rest.SeaTunnelRestClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(SeaTunnelClientProperties.class)
public class SeatunnelClientConfig {

    @Bean
    public RestTemplate seatunnelRestTemplate(SeaTunnelClientProperties props) {
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(props.getConnectTimeoutMs());
        f.setReadTimeout(props.getReadTimeoutMs());
        return new RestTemplate(f);
    }

    @Bean
    public SeaTunnelRestClient seatunnelRestClient(RestTemplate seatunnelRestTemplate,
                                                   SeaTunnelClientResolver seatunnelClientResolver) {
        return new SeaTunnelRestClient(seatunnelRestTemplate, seatunnelClientResolver);
    }
}