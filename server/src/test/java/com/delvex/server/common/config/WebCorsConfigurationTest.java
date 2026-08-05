package com.delvex.server.common.config;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;

class WebCorsConfigurationTest {

    private final WebCorsConfiguration webCorsConfiguration =
            new WebCorsConfiguration();

    @Test
    void shouldConfigureAllowedBrowserOrigins() {
        CorsConfigurationSource source = webCorsConfiguration
                .corsConfigurationSource(new CorsProperties(
                        " http://localhost:3000, "
                                + "https://app.example.com, "
                                + "http://localhost:3000 "));

        org.springframework.web.cors.CorsConfiguration configuration =
                source.getCorsConfiguration(new MockHttpServletRequest(
                        "OPTIONS",
                        "/api/shipments"));

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins())
                .containsExactly(
                        "http://localhost:3000",
                        "https://app.example.com");
        assertThat(configuration.getAllowedMethods())
                .containsExactly(
                        "GET",
                        "POST",
                        "PATCH",
                        "DELETE",
                        "OPTIONS");
        assertThat(configuration.getAllowedHeaders())
                .containsExactly(
                        "Authorization",
                        "Content-Type",
                        "X-Request-ID");
        assertThat(configuration.getExposedHeaders())
                .containsExactly("X-Request-ID");
        assertThat(configuration.getAllowCredentials()).isTrue();
        assertThat(configuration.getMaxAge()).isEqualTo(3600L);
    }

    @Test
    void shouldDenyCrossOriginRequestsWithoutConfiguredOrigins() {
        CorsConfigurationSource source = webCorsConfiguration
                .corsConfigurationSource(new CorsProperties(null));

        org.springframework.web.cors.CorsConfiguration configuration =
                source.getCorsConfiguration(new MockHttpServletRequest(
                        "OPTIONS",
                        "/api/shipments"));

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins())
                .isEqualTo(List.of());
    }
}
