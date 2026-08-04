package com.delvex.server.auth;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
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
            @Value("${auth.refresh-token-ttl}") Duration refreshTokenTtl) {
        this.refreshSessionRepository = refreshSessionRepository;
        this.refreshTokenTtl = refreshTokenTtl;
    }

    @Transactional
    public String issue(UUID userId) {
        Instant issuedAt = Instant.now();
        String refreshToken = generateToken();

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

        currentSession.revoke(now);

        return new RotatedRefreshToken(
                currentSession.getUserId(),
                issue(currentSession.getUserId()));
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
