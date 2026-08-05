package com.delvex.server.common.logging;

import java.io.IOException;
import java.security.Principal;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_HEADER = "X-Request-ID";

    private static final String REQUEST_ID_MDC_KEY = "requestId";
    private static final Pattern VALID_REQUEST_ID = Pattern.compile(
            "[A-Za-z0-9._-]{1,100}");
    private static final Logger LOGGER = LoggerFactory.getLogger(
            RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String requestId = resolveRequestId(
                request.getHeader(REQUEST_ID_HEADER));
        long startedAt = System.nanoTime();

        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } catch (ServletException | IOException | RuntimeException exception) {
            LOGGER.error(
                    "request failed method={} path={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    exception);
            throw exception;
        } finally {
            long durationMs = TimeUnit.NANOSECONDS.toMillis(
                    System.nanoTime() - startedAt);
            Principal principal = request.getUserPrincipal();
            String userId = principal == null
                    ? "anonymous"
                    : principal.getName();

            LOGGER.info(
                    "request completed method={} path={} status={} "
                            + "durationMs={} userId={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    durationMs,
                    userId);

            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }

    private String resolveRequestId(String requestId) {
        if (requestId != null
                && VALID_REQUEST_ID.matcher(requestId).matches()) {
            return requestId;
        }

        return UUID.randomUUID().toString();
    }
}
