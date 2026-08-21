package com.delvex.server.auth;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResendMailConfigurationValidatorTest {

    @Test
    void shouldAcceptCompleteResendConfiguration() {
        assertThatCode(() -> new ResendMailConfigurationValidator(
                resendEnvironment(),
                properties(
                        "https://dev.delvex.example/reset-password",
                        "no-reply@delvex.example")))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRequireResendApiKey() {
        MockEnvironment environment = resendEnvironment()
                .withProperty("spring.mail.password", "");

        assertThatThrownBy(() -> new ResendMailConfigurationValidator(
                environment,
                properties(
                        "https://dev.delvex.example/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Resend SMTP requires RESEND_API_KEY");
    }

    @Test
    void shouldRejectOverriddenResendTransportSettings() {
        MockEnvironment environment = resendEnvironment()
                .withProperty("spring.mail.host", "smtp.example.com");

        assertThatThrownBy(() -> new ResendMailConfigurationValidator(
                environment,
                properties(
                        "https://dev.delvex.example/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Hosted profiles require Resend SMTP");
    }

    @Test
    void shouldRequirePublicResetUrl() {
        assertThatThrownBy(() -> new ResendMailConfigurationValidator(
                resendEnvironment(),
                properties(
                        "http://localhost:3000/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Hosted profiles require PASSWORD_RESET_CLIENT_URL to use HTTPS");
    }

    @Test
    void shouldRequireVerifiedPublicSender() {
        assertThatThrownBy(() -> new ResendMailConfigurationValidator(
                resendEnvironment(),
                properties(
                        "https://dev.delvex.example/reset-password",
                        "no-reply@delvex.local")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Hosted profiles require MAIL_FROM to use a verified public domain");
    }

    private static MockEnvironment resendEnvironment() {
        return new MockEnvironment()
                .withProperty("spring.mail.host", "smtp.resend.com")
                .withProperty("spring.mail.port", "587")
                .withProperty("spring.mail.username", "resend")
                .withProperty("spring.mail.password", "re_test-api-key")
                .withProperty(
                        "spring.mail.properties[mail.smtp.auth]",
                        "true")
                .withProperty(
                        "spring.mail.properties[mail.smtp.starttls.enable]",
                        "true");
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
