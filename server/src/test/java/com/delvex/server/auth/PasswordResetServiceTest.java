package com.delvex.server.auth;

import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    private static final Instant NOW =
            Instant.parse("2026-08-20T18:00:00Z");

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private RefreshSessionRepository refreshSessionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        PasswordResetProperties properties = new PasswordResetProperties(
                URI.create("https://delvex.test/reset-password"),
                Duration.ofMinutes(30),
                "no-reply@delvex.test",
                Duration.ofHours(1),
                Duration.ofHours(1));
        passwordResetService = new PasswordResetService(
                userRepository,
                tokenRepository,
                refreshSessionRepository,
                passwordEncoder,
                properties,
                eventPublisher,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void shouldIssueHashedTokenAndPublishEmailAfterKnownAccountRequest() {
        UUID userId = UUID.randomUUID();
        User user = org.mockito.Mockito.mock(User.class);
        given(user.getId()).willReturn(userId);
        given(user.getEmail()).willReturn("john@example.com");
        given(userRepository.findByEmailIgnoreCase("john@example.com"))
                .willReturn(Optional.of(user));

        passwordResetService.requestReset(" John@Example.COM ");

        ArgumentCaptor<PasswordResetToken> tokenCaptor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<PasswordResetRequestedEvent> eventCaptor =
                ArgumentCaptor.forClass(PasswordResetRequestedEvent.class);

        then(tokenRepository).should().invalidateUnusedByUserId(userId, NOW);
        then(tokenRepository).should().save(tokenCaptor.capture());
        then(eventPublisher).should().publishEvent(eventCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        PasswordResetRequestedEvent event = eventCaptor.getValue();

        assertThat(savedToken.getUserId()).isEqualTo(userId);
        assertThat(savedToken.getTokenHash())
                .isEqualTo(PasswordResetService.hash(event.token()));
        assertThat(savedToken.getTokenHash()).doesNotContain(event.token());
        assertThat(savedToken.getExpiresAt())
                .isEqualTo(NOW.plus(Duration.ofMinutes(30)));
        assertThat(event.email()).isEqualTo("john@example.com");
    }

    @Test
    void shouldSilentlyAcceptUnknownAccountRequest() {
        given(userRepository.findByEmailIgnoreCase("missing@example.com"))
                .willReturn(Optional.empty());

        passwordResetService.requestReset("missing@example.com");

        verifyNoInteractions(
                tokenRepository,
                eventPublisher,
                passwordEncoder,
                refreshSessionRepository);
    }

    @Test
    void shouldChangePasswordInvalidateTokensAndRevokeSessions() {
        UUID userId = UUID.randomUUID();
        PasswordResetToken resetToken = new PasswordResetToken(
                userId,
                PasswordResetService.hash("reset-token"),
                NOW.plusSeconds(60),
                NOW.minusSeconds(60));
        User user = org.mockito.Mockito.mock(User.class);

        given(tokenRepository.findByTokenHash(
                PasswordResetService.hash("reset-token")))
                .willReturn(Optional.of(resetToken));
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.encode("new-strong-password"))
                .willReturn("{bcrypt}new-hash");

        passwordResetService.resetPassword(
                "reset-token",
                "new-strong-password");

        then(user).should().changePassword("{bcrypt}new-hash");
        then(tokenRepository).should().invalidateUnusedByUserId(userId, NOW);
        then(refreshSessionRepository)
                .should()
                .revokeActiveByUserId(userId, NOW);
    }

    @Test
    void shouldRejectExpiredTokenWithoutChangingCredentials() {
        PasswordResetToken resetToken = new PasswordResetToken(
                UUID.randomUUID(),
                PasswordResetService.hash("expired-token"),
                NOW,
                NOW.minusSeconds(60));
        given(tokenRepository.findByTokenHash(
                PasswordResetService.hash("expired-token")))
                .willReturn(Optional.of(resetToken));

        assertThatThrownBy(() -> passwordResetService.resetPassword(
                "expired-token",
                "new-strong-password"))
                .isInstanceOf(InvalidPasswordResetTokenException.class)
                .hasMessage("Password reset token is invalid or expired");

        verifyNoInteractions(
                passwordEncoder,
                refreshSessionRepository);
    }
}
