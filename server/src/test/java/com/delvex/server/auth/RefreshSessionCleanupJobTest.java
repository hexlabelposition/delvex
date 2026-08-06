package com.delvex.server.auth;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class RefreshSessionCleanupJobTest {

    @Mock
    private RefreshSessionRepository refreshSessionRepository;

    @Test
    void shouldDeleteInactiveSessionsAtCurrentTime() {
        Instant now = Instant.parse("2026-08-06T10:00:00Z");
        RefreshSessionCleanupJob cleanupJob =
                new RefreshSessionCleanupJob(
                        refreshSessionRepository,
                        Clock.fixed(now, ZoneOffset.UTC));

        given(refreshSessionRepository.deleteInactiveSessions(now))
                .willReturn(2);

        cleanupJob.cleanup();

        then(refreshSessionRepository)
                .should()
                .deleteInactiveSessions(now);
    }
}
