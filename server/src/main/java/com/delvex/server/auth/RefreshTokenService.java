package com.delvex.server.auth;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshSessionRepository refreshSessionRepository;
    private final Duration refreshTokenTtl;

    public RefreshTokenService(
            RefreshSessionRepository refreshSessionRepository,
            AuthProperties properties) {
        this.refreshSessionRepository = refreshSessionRepository;
        this.refreshTokenTtl = properties.refreshTokenTtl();
    }

    @Transactional
    public String issue(UUID userId) {
        Instant issuedAt = Instant.now();
        String refreshToken = generateToken();

        // Persist only a digest. A database leak must not expose bearer tokens
        // that can be replayed directly against the refresh endpoint.
        refreshSessionRepository.save(new RefreshSession(
                userId,
                hash(refreshToken),
                issuedAt.plus(refreshTokenTtl),
                issuedAt));

        return refreshToken;
    }

    @Transactional
    public RotatedRefreshToken rotate(String refreshToken) {
        Instant now = Instant.now();

        RefreshSession currentSession = refreshSessionRepository
                .findByRefreshTokenHash(hash(refreshToken))
                .orElseThrow(InvalidRefreshTokenException::new);

        if (!currentSession.isActive(now)) {
            throw new InvalidRefreshTokenException();
        }

        // Revocation and replacement share this transaction. A failure while
        // issuing the replacement therefore cannot leave two active tokens.
        currentSession.revoke(now);

        return new RotatedRefreshToken(
                currentSession.getUserId(),
                issue(currentSession.getUserId()));
    }

    @Transactional
    public void revoke(String refreshToken) {
        Instant now = Instant.now();

        refreshSessionRepository
                .findByRefreshTokenHash(hash(refreshToken))
                .filter(session -> session.isActive(now))
                .ifPresent(session -> session.revoke(now));
    }

    static String hash(String token) {
        try {
            byte[] digest = MessageDigest
                    .getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private static String generateToken() {
        byte[] tokenBytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(tokenBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
    }

    public record RotatedRefreshToken(
            UUID userId,
            String refreshToken) {
    }

}
