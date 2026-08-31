package com.delvex.server.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(HealthController.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DatabaseReadinessProbe databaseReadinessProbe;

    @MockitoBean
    private RedisReadinessProbe redisReadinessProbe;

    @Test
    void shouldReturnLivenessWithoutCheckingDependencies() throws Exception {
        mockMvc.perform(get("/api/health/live"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("ok"));

        then(databaseReadinessProbe).shouldHaveNoInteractions();
        then(redisReadinessProbe).shouldHaveNoInteractions();
    }

    @Test
    void shouldReturnReadyWhenDependenciesAreAvailable() throws Exception {
        given(databaseReadinessProbe.isReady()).willReturn(true);
        given(redisReadinessProbe.isReady()).willReturn(true);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void shouldExposeExplicitReadinessEndpoint() throws Exception {
        given(databaseReadinessProbe.isReady()).willReturn(true);
        given(redisReadinessProbe.isReady()).willReturn(true);

        mockMvc.perform(get("/api/health/ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void shouldReturnUnavailableWhenDatabaseIsDown() throws Exception {
        given(databaseReadinessProbe.isReady()).willReturn(false);

        mockMvc.perform(get("/api/health/ready"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status")
                        .value("unavailable"));

        then(redisReadinessProbe).shouldHaveNoInteractions();
    }

    @Test
    void shouldReturnUnavailableWhenRedisIsDown() throws Exception {
        given(databaseReadinessProbe.isReady()).willReturn(true);
        given(redisReadinessProbe.isReady()).willReturn(false);

        mockMvc.perform(get("/api/health/ready"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status")
                        .value("unavailable"));
    }
}
