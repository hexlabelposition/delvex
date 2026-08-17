package com.delvex.server.auth.ratelimit;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.delvex.server.common.error.ApiErrorResponseWriter;

import tools.jackson.databind.json.JsonMapper;

@Configuration
@ConditionalOnBean(RateLimitStore.class)
@EnableConfigurationProperties(AuthRateLimitProperties.class)
public class AuthRateLimitConfiguration implements WebMvcConfigurer {

    private final AuthRateLimitInterceptor interceptor;

    public AuthRateLimitConfiguration(
            RateLimitStore rateLimitStore,
            AuthRateLimitProperties properties,
            JsonMapper jsonMapper) {
        this.interceptor = new AuthRateLimitInterceptor(
                new AuthRateLimiter(
                        rateLimitStore,
                        properties.getWindow()),
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
