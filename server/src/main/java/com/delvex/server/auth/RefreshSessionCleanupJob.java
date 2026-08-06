package com.delvex.server.auth;

import java.time.Clock;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RefreshSessionCleanupJob {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            RefreshSessionCleanupJob.class);

    private final RefreshSessionRepository refreshSessionRepository;
    private final Clock clock;

    public RefreshSessionCleanupJob(
            RefreshSessionRepository refreshSessionRepository,
            Clock clock) {
        this.refreshSessionRepository = refreshSessionRepository;
        this.clock = clock;
    }

    @Scheduled(
            fixedDelayString = "${auth.refresh-session-cleanup-interval}",
            initialDelayString = "${auth.refresh-session-cleanup-initial-delay}")
    @Transactional
    public void cleanup() {
        Instant now = clock.instant();
        int deletedSessions = refreshSessionRepository
                .deleteInactiveSessions(now);

        if (deletedSessions > 0) {
            LOGGER.info(
                    "refresh session cleanup completed deletedSessions={}",
                    deletedSessions);
        } else {
            LOGGER.debug(
                    "refresh session cleanup completed deletedSessions=0");
        }
    }
}
