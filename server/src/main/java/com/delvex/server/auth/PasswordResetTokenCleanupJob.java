package com.delvex.server.auth;

import java.time.Clock;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PasswordResetTokenCleanupJob {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            PasswordResetTokenCleanupJob.class);

    private final PasswordResetTokenRepository tokenRepository;
    private final Clock clock;

    public PasswordResetTokenCleanupJob(
            PasswordResetTokenRepository tokenRepository,
            Clock clock) {
        this.tokenRepository = tokenRepository;
        this.clock = clock;
    }

    @Scheduled(
            fixedDelayString = "${password-reset.cleanup-interval}",
            initialDelayString = "${password-reset.cleanup-initial-delay}")
    @Transactional
    public void cleanup() {
        Instant now = clock.instant();
        int deletedTokens = tokenRepository.deleteInactiveTokens(now);

        if (deletedTokens > 0) {
            LOGGER.info(
                    "password reset token cleanup completed deletedTokens={}",
                    deletedTokens);
        } else {
            LOGGER.debug(
                    "password reset token cleanup completed deletedTokens=0");
        }
    }
}
