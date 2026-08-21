package com.delvex.server.auth;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class PasswordResetMailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            PasswordResetMailService.class);

    private final Optional<PasswordResetEmailSender> emailSender;
    private final PasswordResetProperties properties;

    public PasswordResetMailService(
            Optional<PasswordResetEmailSender> emailSender,
            PasswordResetProperties properties) {
        this.emailSender = emailSender;
        this.properties = properties;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void send(PasswordResetRequestedEvent event) {
        if (emailSender.isEmpty()) {
            LOGGER.info(
                    "password reset email delivery skipped: transport is not configured");
            return;
        }

        String resetUrl = UriComponentsBuilder
                .fromUri(properties.clientUrl())
                .queryParam("token", event.token())
                .build()
                .encode()
                .toUriString();

        PasswordResetEmail email = new PasswordResetEmail(
                properties.mailFrom(),
                event.email(),
                "Reset your Delvex password",
                """
                We received a request to reset your Delvex password.

                Use this link to choose a new password:
                %s

                This link expires in %d minutes. If you did not request a reset, ignore this email.
                """.formatted(
                        resetUrl,
                        properties.tokenTtl().toMinutes()));

        try {
            emailSender.orElseThrow().send(email);
        } catch (EmailDeliveryException exception) {
            LOGGER.error(
                    "password reset email delivery failed",
                    exception);
        }
    }
}
