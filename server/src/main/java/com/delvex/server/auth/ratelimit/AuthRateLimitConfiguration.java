package com.delvex.server.auth.ratelimit;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.delvex.server.common.error.ApiErrorResponseWriter;

import tools.jackson.databind.json.JsonMapper;

@Configuration
@EnableConfigurationProperties(AuthRateLimitProperties.class)
public class AuthRateLimitConfiguration implements WebMvcConfigurer {

    private final AuthRateLimitInterceptor interceptor;

    public AuthRateLimitConfiguration(
            AuthRateLimitProperties properties,
            JsonMapper jsonMapper) {
        this.interceptor = new AuthRateLimitInterceptor(
                new AuthRateLimiter(properties.getWindow()),
                properties,
                new ClientIpResolver(
                        properties.getTrustedProxyCidrs()),
                new ApiErrorResponseWriter(jsonMapper));
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptor)
                .addPathPatterns(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/refresh");
    }
}
