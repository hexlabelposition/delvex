package com.delvex.server.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.delvex.server.user.User;
import com.delvex.server.user.UserRepository;

@Service
public class PasswordResetService {

    private static final Logger LOGGER = LoggerFactory.getLogger(
            PasswordResetService.class);
    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final RefreshSessionRepository refreshSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetProperties properties;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            RefreshSessionRepository refreshSessionRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetProperties properties,
            ApplicationEventPublisher eventPublisher,
            Clock clock) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.refreshSessionRepository = refreshSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
        this.eventPublisher = eventPublisher;
        this.clock = clock;
    }

    @Transactional
    public void requestReset(String requestedEmail) {
        String email = requestedEmail.strip().toLowerCase(Locale.ROOT);

        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            Instant now = clock.instant();
            String token = generateToken();

            tokenRepository.invalidateUnusedByUserId(user.getId(), now);
            tokenRepository.save(new PasswordResetToken(
                    user.getId(),
                    hash(token),
                    now.plus(properties.tokenTtl()),
                    now));
            eventPublisher.publishEvent(new PasswordResetRequestedEvent(
                    user.getEmail(),
                    token));

            LOGGER.info("password reset requested userId={}", user.getId());
        });
    }

    @Transactional
    public void resetPassword(String token, String password) {
        Instant now = clock.instant();
        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(hash(token))
                .filter(candidate -> candidate.isActive(now))
                .orElseThrow(InvalidPasswordResetTokenException::new);
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(InvalidPasswordResetTokenException::new);

        user.changePassword(passwordEncoder.encode(password));
        tokenRepository.invalidateUnusedByUserId(user.getId(), now);
        refreshSessionRepository.revokeActiveByUserId(user.getId(), now);

        LOGGER.info("password reset completed userId={}", user.getId());
    }

    static String hash(String token) {
        try {
            byte[] digest = MessageDigest
                    .getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is not available",
                    exception);
        }
    }

    private static String generateToken() {
        byte[] tokenBytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(tokenBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
    }
}
