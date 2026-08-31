package com.delvex.server.common.config;

import java.util.List;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductionConfigurationValidatorTest {

    @Test
    void shouldAcceptSecureProductionConfiguration() {
        assertDoesNotThrow(() ->
                ProductionConfigurationValidator.validate(
                        false,
                        "https://app.example.com,"
                                + "https://admin.example.com:8443",
                        true,
                        false,
                        false));
    }

    @Test
    void shouldRejectConflictingProfileInProduction() {
        assertInvalid(true, "https://app.example.com", true, false, false);
    }

    @Test
    void shouldRejectInsecureRefreshCookie() {
        assertInvalid(false, "https://app.example.com", false, false, false);
    }

    @Test
    void shouldRejectEnabledDocumentation() {
        assertInvalid(false, "https://app.example.com", true, true, false);
        assertInvalid(false, "https://app.example.com", true, false, true);
    }

    @Test
    void shouldRejectMissingOrUnsafeCorsOrigins() {
        for (String origins : List.of(
                "",
                "*",
                "http://app.example.com",
                "https://localhost:3000",
                "https://app.example.com/path")) {
            assertInvalid(false, origins, true, false, false);
        }
    }

    private void assertInvalid(
            boolean conflictingProfileActive,
            String allowedOrigins,
            boolean secureCookie,
            boolean apiDocsEnabled,
            boolean swaggerUiEnabled) {
        assertThrows(
                IllegalStateException.class,
                () -> ProductionConfigurationValidator.validate(
                        conflictingProfileActive,
                        allowedOrigins,
                        secureCookie,
                        apiDocsEnabled,
                        swaggerUiEnabled));
    }
}
