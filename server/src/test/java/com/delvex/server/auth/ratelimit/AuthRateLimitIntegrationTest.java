package com.delvex.server.auth.ratelimit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "rate-limit.auth.login-requests=1",
        "rate-limit.auth.register-requests=10",
        "rate-limit.auth.refresh-requests=10"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthRateLimitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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
}
