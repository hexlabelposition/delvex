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
class PasswordResetTokenCleanupJobTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Test
    void shouldDeleteInactiveTokensAtCurrentTime() {
        Instant now = Instant.parse("2026-08-20T18:00:00Z");
        PasswordResetTokenCleanupJob cleanupJob =
                new PasswordResetTokenCleanupJob(
                        tokenRepository,
                        Clock.fixed(now, ZoneOffset.UTC));

        given(tokenRepository.deleteInactiveTokens(now)).willReturn(2);

        cleanupJob.cleanup();

        then(tokenRepository).should().deleteInactiveTokens(now);
    }
}
