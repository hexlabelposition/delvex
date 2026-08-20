package com.delvex.server.auth;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class PasswordResetMailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Test
    void shouldSendResetLinkWithoutLoggingOrPersistingRawToken() {
        PasswordResetMailService mailService = new PasswordResetMailService(
                mailSender,
                new PasswordResetProperties(
                        URI.create("https://delvex.test/reset-password"),
                        Duration.ofMinutes(30),
                        "no-reply@delvex.test",
                        Duration.ofHours(1),
                        Duration.ofHours(1)));

        mailService.send(new PasswordResetRequestedEvent(
                "john@example.com",
                "reset-token"));

        ArgumentCaptor<SimpleMailMessage> messageCaptor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        then(mailSender).should().send(messageCaptor.capture());

        SimpleMailMessage message = messageCaptor.getValue();
        assertThat(message.getFrom()).isEqualTo("no-reply@delvex.test");
        assertThat(message.getTo()).containsExactly("john@example.com");
        assertThat(message.getSubject())
                .isEqualTo("Reset your Delvex password");
        assertThat(message.getText())
                .contains("https://delvex.test/reset-password?token=reset-token")
                .contains("30 minutes");
    }
}
