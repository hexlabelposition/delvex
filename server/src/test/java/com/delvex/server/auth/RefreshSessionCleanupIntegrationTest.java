package com.delvex.server.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class RefreshSessionCleanupIntegrationTest {

    @Autowired
    private RefreshSessionRepository refreshSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldDeleteExpiredAndRevokedSessionsOnly() {
        User user = userRepository.saveAndFlush(new User(
                "cleanup-" + UUID.randomUUID() + "@example.com",
                "{noop}password",
                "Session",
                "Cleanup"));
        Instant now = Instant.parse("2026-08-06T10:00:00Z");

        RefreshSession expiredSession = new RefreshSession(
                user.getId(),
                "a".repeat(64),
                now.minus(Duration.ofMinutes(1)),
                now.minus(Duration.ofDays(31)));
        RefreshSession revokedSession = new RefreshSession(
                user.getId(),
                "b".repeat(64),
                now.plus(Duration.ofDays(1)),
                now.minus(Duration.ofHours(1)));
        revokedSession.revoke(now.minus(Duration.ofMinutes(30)));
        RefreshSession activeSession = new RefreshSession(
                user.getId(),
                "c".repeat(64),
                now.plus(Duration.ofDays(1)),
                now.minus(Duration.ofHours(1)));

        refreshSessionRepository.saveAllAndFlush(List.of(
                expiredSession,
                revokedSession,
                activeSession));

        int deletedSessions = refreshSessionRepository
                .deleteInactiveSessions(now);

        assertThat(deletedSessions).isEqualTo(2);
        assertThat(refreshSessionRepository.findByRefreshTokenHash(
                expiredSession.getRefreshTokenHash()))
                .isEmpty();
        assertThat(refreshSessionRepository.findByRefreshTokenHash(
                revokedSession.getRefreshTokenHash()))
                .isEmpty();
        assertThat(refreshSessionRepository.findByRefreshTokenHash(
                activeSession.getRefreshTokenHash()))
                .isPresent();
    }
}
