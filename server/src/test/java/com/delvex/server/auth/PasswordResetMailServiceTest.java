package com.delvex.server.auth;

import java.net.URI;
import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class PasswordResetMailServiceTest {

    @Mock
    private PasswordResetEmailSender emailSender;

    @Test
    void shouldCreateResetEmailWithoutLoggingOrPersistingRawToken() {
        PasswordResetMailService mailService = new PasswordResetMailService(
                Optional.of(emailSender),
                properties());

        mailService.send(new PasswordResetRequestedEvent(
                "john@example.com",
                "reset-token"));

        ArgumentCaptor<PasswordResetEmail> emailCaptor =
                ArgumentCaptor.forClass(PasswordResetEmail.class);
        then(emailSender).should().send(emailCaptor.capture());

        PasswordResetEmail email = emailCaptor.getValue();
        assertThat(email.from()).isEqualTo("no-reply@delvex.test");
        assertThat(email.to()).isEqualTo("john@example.com");
        assertThat(email.subject())
                .isEqualTo("Reset your Delvex password");
        assertThat(email.text())
                .contains("https://delvex.test/reset-password?token=reset-token")
                .contains("30 minutes");
    }

    @Test
    void shouldSkipDeliveryWhenTransportIsNotConfigured() {
        PasswordResetMailService mailService = new PasswordResetMailService(
                Optional.empty(),
                properties());

        assertDoesNotThrow(() -> mailService.send(
                new PasswordResetRequestedEvent(
                        "john@example.com",
                        "reset-token")));
    }

    private static PasswordResetProperties properties() {
        return new PasswordResetProperties(
                URI.create("https://delvex.test/reset-password"),
                Duration.ofMinutes(30),
                "no-reply@delvex.test",
                Duration.ofHours(1),
                Duration.ofHours(1));
    }
}
