package com.delvex.server.auth.ratelimit;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.delvex.server.common.error.ApiErrorResponseWriter;

@Configuration
@EnableConfigurationProperties(AuthRateLimitProperties.class)
public class AuthRateLimitConfiguration implements WebMvcConfigurer {

    private final AuthRateLimitInterceptor interceptor;

    public AuthRateLimitConfiguration(
            AuthRateLimitProperties properties,
            ApiErrorResponseWriter errorResponseWriter) {
        this.interceptor = new AuthRateLimitInterceptor(
                new AuthRateLimiter(properties.getWindow()),
                properties,
                errorResponseWriter);
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
