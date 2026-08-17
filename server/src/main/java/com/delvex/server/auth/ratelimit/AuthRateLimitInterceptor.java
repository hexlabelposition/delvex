package com.delvex.server.auth.ratelimit;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;

import com.delvex.server.auth.ratelimit.AuthRateLimiter.RateLimitDecision;
import com.delvex.server.common.error.ApiErrorResponseWriter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthRateLimitInterceptor implements HandlerInterceptor {

    private static final String REGISTER_PATH = "/api/auth/register";
    private static final String LOGIN_PATH = "/api/auth/login";
    private static final String REFRESH_PATH = "/api/auth/refresh";

    private final AuthRateLimiter rateLimiter;
    private final AuthRateLimitProperties properties;
    private final ClientIpResolver clientIpResolver;
    private final ApiErrorResponseWriter errorResponseWriter;

    public AuthRateLimitInterceptor(
            AuthRateLimiter rateLimiter,
            AuthRateLimitProperties properties,
            ClientIpResolver clientIpResolver,
            ApiErrorResponseWriter errorResponseWriter) {
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.clientIpResolver = clientIpResolver;
        this.errorResponseWriter = errorResponseWriter;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws IOException {
        RateLimitRule rule = resolveRule(request);

        if (rule == null) {
            return true;
        }

        RateLimitDecision decision;

        try {
            decision = rateLimiter.check(
                    rule.endpoint(),
                    clientIpResolver.resolve(request),
                    rule.maxRequests());
        } catch (RateLimitStoreUnavailableException exception) {
            errorResponseWriter.write(
                    request,
                    response,
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Authentication temporarily unavailable");
            return false;
        }

        if (decision.allowed()) {
            return true;
        }

        response.setHeader(
                HttpHeaders.RETRY_AFTER,
                Long.toString(decision.retryAfterSeconds()));
        errorResponseWriter.write(
                request,
                response,
                HttpStatus.TOO_MANY_REQUESTS,
                "Too many requests");

        return false;
    }

    private RateLimitRule resolveRule(HttpServletRequest request) {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return null;
        }

        return switch (request.getRequestURI()) {
            case REGISTER_PATH -> new RateLimitRule(
                    "register",
                    properties.getRegisterRequests());
            case LOGIN_PATH -> new RateLimitRule(
                    "login",
                    properties.getLoginRequests());
            case REFRESH_PATH -> new RateLimitRule(
                    "refresh",
                    properties.getRefreshRequests());
            default -> null;
        };
    }

    private record RateLimitRule(
            String endpoint,
            int maxRequests) {
    }
}
