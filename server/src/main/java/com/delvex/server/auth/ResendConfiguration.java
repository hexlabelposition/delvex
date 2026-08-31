package com.delvex.server.auth;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

@Configuration(proxyBeanMethods = false)
@Profile("hosted")
@EnableConfigurationProperties(ResendProperties.class)
public class ResendConfiguration {

    private static final String RESEND_API_URL = "https://api.resend.com";

    @Bean
    RestClient resendRestClient(ResendProperties properties) {
        return RestClient.builder()
                .baseUrl(RESEND_API_URL)
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + properties.apiKey())
                .build();
    }
}
