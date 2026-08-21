package com.delvex.server.auth;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class PasswordResetMailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            PasswordResetMailService.class);

    private final Optional<JavaMailSender> mailSender;
    private final PasswordResetProperties properties;

    public PasswordResetMailService(
            Optional<JavaMailSender> mailSender,
            PasswordResetProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void send(PasswordResetRequestedEvent event) {
        if (mailSender.isEmpty()) {
            LOGGER.info(
                    "password reset email delivery skipped: SMTP is not configured");
            return;
        }

        String resetUrl = UriComponentsBuilder
                .fromUri(properties.clientUrl())
                .queryParam("token", event.token())
                .build()
                .encode()
                .toUriString();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.mailFrom());
        message.setTo(event.email());
        message.setSubject("Reset your Delvex password");
        message.setText("""
                We received a request to reset your Delvex password.

                Use this link to choose a new password:
                %s

                This link expires in %d minutes. If you did not request a reset, ignore this email.
                """.formatted(
                        resetUrl,
                        properties.tokenTtl().toMinutes()));

        try {
            mailSender.orElseThrow().send(message);
        } catch (MailException exception) {
            LOGGER.error(
                    "password reset email delivery failed",
                    exception);
        }
    }
}
