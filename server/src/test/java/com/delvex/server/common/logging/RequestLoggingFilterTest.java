package com.delvex.server.common.logging;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import jakarta.servlet.ServletException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RequestLoggingFilterTest {

    private final RequestLoggingFilter filter = new RequestLoggingFilter();

    private Logger logger;
    private Level previousLevel;
    private ListAppender<ILoggingEvent> appender;

    @BeforeEach
    void setUp() {
        logger = (Logger) LoggerFactory.getLogger(
                RequestLoggingFilter.class);
        previousLevel = logger.getLevel();
        logger.setLevel(Level.INFO);

        appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
    }

    @AfterEach
    void tearDown() {
        logger.detachAppender(appender);
        logger.setLevel(previousLevel);
        appender.stop();
        MDC.clear();
    }

    @Test
    void shouldPreserveRequestIdAndLogRequestDetails() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/users/me");
        request.addHeader(
                RequestLoggingFilter.REQUEST_ID_HEADER,
                "request-123");
        request.setUserPrincipal(() -> "user-123");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(
                request,
                response,
                new MockFilterChain());

        assertThat(response.getHeader(
                RequestLoggingFilter.REQUEST_ID_HEADER))
                .isEqualTo("request-123");
        assertThat(MDC.get("requestId")).isNull();

        assertThat(singleLog())
                .contains("method=GET")
                .contains("path=/api/users/me")
                .contains("status=200")
                .contains("durationMs=")
                .contains("userId=user-123");
    }

    @Test
    void shouldReplaceInvalidRequestId() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/health");
        request.addHeader(
                RequestLoggingFilter.REQUEST_ID_HEADER,
                "invalid request id");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(
                request,
                response,
                new MockFilterChain());

        assertThat(response.getHeader(
                RequestLoggingFilter.REQUEST_ID_HEADER))
                .isNotBlank()
                .doesNotContain(" ");
    }

    @Test
    void shouldNotLogQueryParametersOrRequestBody() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST",
                "/api/auth/login");
        request.setQueryString(
                "token=secret-access-token");
        request.setContent(
                """
                {
                  "password": "secret-password"
                }
                """.getBytes(StandardCharsets.UTF_8));

        filter.doFilter(
                request,
                new MockHttpServletResponse(),
                new MockFilterChain());

        assertThat(singleLog())
                .doesNotContain("secret-access-token")
                .doesNotContain("secret-password")
                .doesNotContain("token=")
                .doesNotContain("password");
    }

    @Test
    void shouldClearRequestIdWhenRequestFails() {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/failure");

        assertThatThrownBy(() -> filter.doFilter(
                request,
                new MockHttpServletResponse(),
                (servletRequest, servletResponse) -> {
                    throw new ServletException("Failure");
                }))
                .isInstanceOf(ServletException.class);

        assertThat(MDC.get("requestId")).isNull();
        assertThat(appender.list)
                .anySatisfy(event -> {
                    assertThat(event.getLevel()).isEqualTo(Level.ERROR);
                    assertThat(event.getFormattedMessage())
                            .contains("request failed")
                            .contains("method=GET")
                            .contains("path=/api/failure");
                });
    }

    private String singleLog() {
        assertThat(appender.list).hasSize(1);
        return appender.list.getFirst().getFormattedMessage();
    }
}
