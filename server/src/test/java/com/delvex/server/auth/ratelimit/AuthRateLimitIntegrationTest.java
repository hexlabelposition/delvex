package com.delvex.server.auth.ratelimit;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "rate-limit.auth.login-requests=1",
        "rate-limit.auth.register-requests=10",
        "rate-limit.auth.refresh-requests=10",
        "rate-limit.auth.forgot-password-requests=1",
        "rate-limit.auth.reset-password-requests=10",
        "rate-limit.auth.trusted-proxy-cidrs=10.0.0.0/8"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthRateLimitIntegrationTest {

    private static final String RATE_LIMIT_KEY_PATTERN =
            "delvex:rate-limit:auth:*";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @BeforeEach
    void clearRateLimitCounters() {
        Set<String> keys = redisTemplate.keys(
                RATE_LIMIT_KEY_PATTERN);

        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Test
    void shouldLimitLoginRequestsByClientAddress() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .with(request -> {
                    request.setRemoteAddr("192.0.2.1");
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/login")
                .with(request -> {
                    request.setRemoteAddr("192.0.2.1");
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string(
                        "Retry-After",
                        matchesPattern("[1-9][0-9]*")))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.error")
                        .value("Too Many Requests"))
                .andExpect(jsonPath("$.message")
                        .value("Too many requests"))
                .andExpect(jsonPath("$.path")
                        .value("/api/auth/login"))
                .andExpect(jsonPath("$.fieldErrors").isEmpty());

        mockMvc.perform(post("/api/auth/login")
                .with(request -> {
                    request.setRemoteAddr("192.0.2.2");
                    return request;
                })
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldLimitForwardedClientsIndependently()
            throws Exception {
        performLoginFromProxy("198.51.100.31")
                .andExpect(status().isBadRequest());
        performLoginFromProxy("198.51.100.32")
                .andExpect(status().isBadRequest());
        performLoginFromProxy("198.51.100.31")
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void shouldLimitPasswordResetEmailRequests() throws Exception {
        for (int attempt = 0; attempt < 2; attempt++) {
            ResultActions result = mockMvc.perform(
                    post("/api/auth/forgot-password")
                            .with(request -> {
                                request.setRemoteAddr("192.0.2.20");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"));

            result.andExpect(attempt == 0
                    ? status().isBadRequest()
                    : status().isTooManyRequests());
        }
    }

    private ResultActions
            performLoginFromProxy(String clientAddress)
                    throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .with(request -> {
                    request.setRemoteAddr("10.0.0.5");
                    return request;
                })
                .header("X-Forwarded-For", clientAddress)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"));
    }
}
