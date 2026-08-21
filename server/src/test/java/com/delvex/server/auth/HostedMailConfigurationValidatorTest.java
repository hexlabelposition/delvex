package com.delvex.server.auth;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HostedMailConfigurationValidatorTest {

    @Test
    void shouldAllowProductionWithoutEmailDelivery() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.mail.host", "");

        assertThatCode(() -> new HostedMailConfigurationValidator(
                environment,
                properties(
                        "http://localhost:3000/reset-password",
                        "no-reply@delvex.local")))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldAcceptResendSmtpConfiguration() {
        MockEnvironment environment = resendEnvironment();

        assertThatCode(() -> new HostedMailConfigurationValidator(
                environment,
                properties(
                        "https://app.delvex.example/reset-password",
                        "no-reply@delvex.example")))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRequireHostedSmtpCredentials() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.mail.host", "smtp.example.com")
                .withProperty("spring.mail.username", "smtp-user");

        assertThatThrownBy(() -> new HostedMailConfigurationValidator(
                environment,
                properties(
                        "https://app.delvex.example/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Hosted SMTP requires MAIL_PASSWORD");
    }

    @Test
    void shouldRequirePublicResetUrlForHostedDelivery() {
        assertThatThrownBy(() -> new HostedMailConfigurationValidator(
                resendEnvironment(),
                properties(
                        "http://localhost:3000/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Hosted SMTP requires PASSWORD_RESET_CLIENT_URL to use HTTPS");
    }

    @Test
    void shouldRequireVerifiedPublicSenderForHostedDelivery() {
        assertThatThrownBy(() -> new HostedMailConfigurationValidator(
                resendEnvironment(),
                properties(
                        "https://app.delvex.example/reset-password",
                        "no-reply@delvex.local")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Hosted SMTP requires MAIL_FROM to use a verified public domain");
    }

    @Test
    void shouldRejectInvalidResendSettings() {
        MockEnvironment environment = resendEnvironment()
                .withProperty("spring.mail.username", "smtp-user");

        assertThatThrownBy(() -> new HostedMailConfigurationValidator(
                environment,
                properties(
                        "https://app.delvex.example/reset-password",
                        "no-reply@delvex.example")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Resend SMTP requires MAIL_USERNAME=resend");
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
