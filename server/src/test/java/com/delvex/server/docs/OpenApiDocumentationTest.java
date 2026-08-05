package com.delvex.server.docs;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class OpenApiDocumentationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldExposeSwaggerUi() throws Exception {
        mockMvc.perform(get("/docs"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(
                        "Location",
                        containsString("swagger-ui")));
    }

    @Test
    void shouldExposeOpenApiDocument() throws Exception {
        mockMvc.perform(get("/docs/openapi.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").exists())
                .andExpect(jsonPath("$.info.title").value("Delvex API"))
                .andExpect(jsonPath("$.info.version").value("v1"))
                .andExpect(jsonPath("$.paths['/api/health']").exists())
                .andExpect(jsonPath(
                        "$.components.securitySchemes.bearerAuth.type")
                        .value("http"))
                .andExpect(jsonPath(
                        "$.components.securitySchemes.bearerAuth.scheme")
                        .value("bearer"))
                .andExpect(jsonPath(
                        "$.paths['/api/shipments'].get.security[0].bearerAuth")
                        .isArray())
                .andExpect(jsonPath(
                        "$.paths['/api/shipments'].post.security[0].bearerAuth")
                        .isArray())
                .andExpect(jsonPath(
                        "$.paths['/api/users/me'].get.security[0].bearerAuth")
                        .isArray())
                .andExpect(jsonPath(
                        "$.paths['/api/users/me'].patch.security[0].bearerAuth")
                        .isArray())
                .andExpect(jsonPath(
                        "$.paths['/api/health'].get.security")
                        .doesNotExist())
                .andExpect(jsonPath(
                        "$.paths['/api/auth/login'].post.security")
                        .doesNotExist());
    }
}
