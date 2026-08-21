package com.delvex.server.auth;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HostedEmailConfigurationValidatorTest {

    @Test
    void shouldAcceptHostedEmailConfiguration() {
        for (String mailFrom : new String[] {
                "no-reply@delvex.example",
                "Delvex <no-reply@delvex.example>"
        }) {
            assertThatCode(() -> new HostedEmailConfigurationValidator(
                    properties(
                            "https://dev.delvex.example/reset-password",
                            mailFrom)))
                    .doesNotThrowAnyException();
        }
    }

    @Test
    void shouldRequirePublicResetUrl() {
        assertThatThrownBy(() -> new HostedEmailConfigurationValidator(
                properties(
                        "http://localhost:3000/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Hosted profiles require PASSWORD_RESET_CLIENT_URL to use HTTPS");
    }

    @Test
    void shouldRequireVerifiedPublicSender() {
        for (String mailFrom : new String[] {
                "no-reply@delvex.local",
                "Delvex <no-reply@delvex.local>"
        }) {
            assertThatThrownBy(() -> new HostedEmailConfigurationValidator(
                    properties(
                            "https://dev.delvex.example/reset-password",
                            mailFrom)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage(
                            "Hosted profiles require MAIL_FROM to use a verified public domain");
        }
    }

    private static PasswordResetProperties properties(
            String clientUrl,
            String mailFrom) {
        return new PasswordResetProperties(
                URI.create(clientUrl),
                Duration.ofMinutes(30),
                mailFrom,
                Duration.ofHours(1),
                Duration.ofHours(1));
    }
}
