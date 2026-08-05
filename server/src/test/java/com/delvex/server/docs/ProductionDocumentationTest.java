package com.delvex.server.docs;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
class ProductionDocumentationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldNotExposeDocumentationInProduction() throws Exception {
        mockMvc.perform(get("/docs"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/docs").with(jwt()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/docs/openapi.json").with(jwt()))
                .andExpect(status().isNotFound());
    }
}
