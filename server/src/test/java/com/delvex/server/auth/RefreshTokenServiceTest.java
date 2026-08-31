package com.delvex.server.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.delvex.server.auth.TestAuthProperties.authProperties;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshSessionRepository refreshSessionRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(
                refreshSessionRepository,
                authProperties());
    }

    @Test
    void shouldIssueRefreshToken() {
        UUID userId = UUID.randomUUID();
        Instant beforeIssue = Instant.now();

        String refreshToken = refreshTokenService.issue(userId);

        ArgumentCaptor<RefreshSession> sessionCaptor = ArgumentCaptor
                .forClass(RefreshSession.class);

        then(refreshSessionRepository)
                .should()
                .save(sessionCaptor.capture());

        RefreshSession session = sessionCaptor.getValue();

        assertThat(refreshToken).isNotBlank();
        assertThat(session.getUserId()).isEqualTo(userId);
        assertThat(session.getRefreshTokenHash())
                .isEqualTo(RefreshTokenService.hash(refreshToken))
                .isNotEqualTo(refreshToken);
        assertThat(session.getExpiresAt())
                .isAfter(beforeIssue.plus(Duration.ofDays(29)));
    }

    @Test
    void shouldRotateRefreshToken() {
        UUID userId = UUID.randomUUID();
        String currentToken = "current-refresh-token";
        RefreshSession currentSession = new RefreshSession(
                userId,
                RefreshTokenService.hash(currentToken),
                Instant.now().plus(Duration.ofDays(1)),
                Instant.now());

        given(refreshSessionRepository.findByRefreshTokenHash(
                RefreshTokenService.hash(currentToken)))
                .willReturn(Optional.of(currentSession));

        RefreshTokenService.RotatedRefreshToken rotatedToken = refreshTokenService
                .rotate(currentToken);

        assertThat(rotatedToken.userId()).isEqualTo(userId);
        assertThat(rotatedToken.refreshToken())
                .isNotBlank()
                .isNotEqualTo(currentToken);
        assertThat(currentSession.getRevokedAt()).isNotNull();

        then(refreshSessionRepository)
                .should()
                .save(any(RefreshSession.class));
    }

    @Test
    void shouldRejectUnknownRefreshToken() {
        given(refreshSessionRepository.findByRefreshTokenHash(any(String.class)))
                .willReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.rotate("unknown-token"))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Refresh token is invalid or expired");

        then(refreshSessionRepository)
                .should(never())
                .save(any(RefreshSession.class));
    }

    @Test
    void shouldRejectExpiredRefreshToken() {
        String expiredToken = "expired-refresh-token";
        RefreshSession expiredSession = new RefreshSession(
                UUID.randomUUID(),
                RefreshTokenService.hash(expiredToken),
                Instant.now().minus(Duration.ofDays(1)),
                Instant.now().minus(Duration.ofDays(2)));

        given(refreshSessionRepository.findByRefreshTokenHash(
                RefreshTokenService.hash(expiredToken)))
                .willReturn(Optional.of(expiredSession));

        assertThatThrownBy(() -> refreshTokenService.rotate(expiredToken))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Refresh token is invalid or expired");

        then(refreshSessionRepository)
                .should(never())
                .save(any(RefreshSession.class));
    }
    @Test
    void shouldRevokeActiveRefreshSession() {
        String refreshToken = "refresh-token";
        RefreshSession session = new RefreshSession(
                UUID.randomUUID(),
                RefreshTokenService.hash(refreshToken),
                Instant.now().plus(Duration.ofDays(1)),
                Instant.now());

        given(refreshSessionRepository.findByRefreshTokenHash(
                RefreshTokenService.hash(refreshToken)))
                .willReturn(Optional.of(session));

        refreshTokenService.revoke(refreshToken);

        assertThat(session.getRevokedAt()).isNotNull();
    }

    @Test
    void shouldIgnoreUnknownRefreshSessionOnLogout() {
        given(refreshSessionRepository.findByRefreshTokenHash(any(String.class)))
                .willReturn(Optional.empty());

        refreshTokenService.revoke("unknown-token");

        then(refreshSessionRepository)
                .should()
                .findByRefreshTokenHash(RefreshTokenService.hash("unknown-token"));
    }

    @Test
    void shouldIgnoreExpiredRefreshSessionOnLogout() {
        String refreshToken = "expired-refresh-token";
        RefreshSession session = new RefreshSession(
                UUID.randomUUID(),
                RefreshTokenService.hash(refreshToken),
                Instant.now().minus(Duration.ofDays(1)),
                Instant.now().minus(Duration.ofDays(2)));

        given(refreshSessionRepository.findByRefreshTokenHash(
                RefreshTokenService.hash(refreshToken)))
                .willReturn(Optional.of(session));

        refreshTokenService.revoke(refreshToken);

        assertThat(session.getRevokedAt()).isNull();
    }

}
