package com.delvex.server.common.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.delvex.server.auth.SecurityConfiguration;
import com.delvex.server.health.DatabaseReadinessProbe;
import com.delvex.server.health.HealthController;
import com.delvex.server.health.RedisReadinessProbe;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import({
        SecurityConfiguration.class,
        WebCorsConfiguration.class
})
@TestPropertySource(properties = {
        "cors.allowed-origins=http://localhost:3000"
})
class CorsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private DatabaseReadinessProbe databaseReadinessProbe;

    @MockitoBean
    private RedisReadinessProbe redisReadinessProbe;

    @Test
    void shouldAllowConfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/shipments")
                .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                .header(
                        HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD,
                        "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                        "http://localhost:3000"))
                .andExpect(header().string(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS,
                        "true"));
    }

    @Test
    void shouldRejectUnconfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/shipments")
                .header(HttpHeaders.ORIGIN, "https://untrusted.example.com")
                .header(
                        HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD,
                        "GET"))
                .andExpect(status().isForbidden());
    }
}

