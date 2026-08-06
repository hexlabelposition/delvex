package com.delvex.server.docs;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class OpenApiDocumentationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldServeSwaggerUiDirectly() throws Exception {
        for (String path : List.of("/docs", "/docs/")) {
            mockMvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(
                            MediaType.TEXT_HTML))
                    .andExpect(content().string(containsString(
                            "<div id=\"swagger-ui\"></div>")))
                    .andExpect(content().string(containsString(
                            "/swagger-ui/swagger-ui-bundle.js")));
        }
    }

    @Test
    void shouldExposeConfiguredSwaggerUiAssets() throws Exception {
        mockMvc.perform(get("/swagger-ui/swagger-ui-bundle.js"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/swagger-ui/swagger-initializer.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(
                        "/docs/openapi.json")));
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
                        "$.paths['/api/health/live']")
                        .exists())
                .andExpect(jsonPath(
                        "$.paths['/api/health/ready']")
                        .exists())
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
                        "$.paths['/api/health/live'].get.security")
                        .doesNotExist())
                .andExpect(jsonPath(
                        "$.paths['/api/health/ready'].get.security")
                        .doesNotExist())
                .andExpect(jsonPath(
                        "$.paths['/api/auth/login'].post.security")
                        .doesNotExist());
    }
}
