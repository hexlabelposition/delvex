package com.delvex.server.auth;

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
class MailpitPasswordResetEmailSenderTest {

    @Mock
    private JavaMailSender mailSender;

    @Test
    void shouldMapEmailToSmtpMessage() {
        MailpitPasswordResetEmailSender sender =
                new MailpitPasswordResetEmailSender(mailSender);

        sender.send(email());

        ArgumentCaptor<SimpleMailMessage> messageCaptor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        then(mailSender).should().send(messageCaptor.capture());

        SimpleMailMessage message = messageCaptor.getValue();
        assertThat(message.getFrom()).isEqualTo("no-reply@delvex.local");
        assertThat(message.getTo()).containsExactly("john@example.com");
        assertThat(message.getSubject()).isEqualTo("Reset password");
        assertThat(message.getText()).isEqualTo("Reset link");
    }

    private static PasswordResetEmail email() {
        return new PasswordResetEmail(
                "no-reply@delvex.local",
                "john@example.com",
                "Reset password",
                "Reset link");
    }
}
