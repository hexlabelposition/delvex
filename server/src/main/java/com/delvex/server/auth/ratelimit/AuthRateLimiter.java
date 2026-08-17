package com.delvex.server.auth.ratelimit;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.HexFormat;

public class AuthRateLimiter {

    private static final String KEY_PREFIX =
            "delvex:rate-limit:auth:";

    private final RateLimitStore store;
    private final long windowMillis;
    private final Clock clock;

    public AuthRateLimiter(
            RateLimitStore store,
            Duration window) {
        this(store, window, Clock.systemUTC());
    }

    AuthRateLimiter(
            RateLimitStore store,
            Duration window,
            Clock clock) {
        this.store = store;
        this.windowMillis = window.toMillis();
        this.clock = clock;
    }

    public RateLimitDecision check(
            String endpoint,
            String clientId,
            int maxRequests) {
        long now = clock.millis();
        long windowStart = now - Math.floorMod(now, windowMillis);
        long windowEnd = windowStart + windowMillis;
        Duration timeToLive = Duration.ofMillis(
                Math.max(1, windowEnd - now));
        String key = createKey(endpoint, clientId, windowStart);

        // Redis increments the shared counter and assigns its expiry in one
        // script, so concurrent requests and multiple server instances cannot
        // lose updates or create counters without a TTL.
        long requests = store.increment(key, timeToLive);
        long retryAfterSeconds = Math.max(
                1,
                (windowEnd - now + 999) / 1000);

        return new RateLimitDecision(
                requests <= maxRequests,
                retryAfterSeconds);
    }

    private static String createKey(
            String endpoint,
            String clientId,
            long windowStart) {
        return KEY_PREFIX
                + endpoint
                + ":"
                + hash(clientId)
                + ":"
                + windowStart;
    }

    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest
                    .getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is not available",
                    exception);
        }
    }

    public record RateLimitDecision(
            boolean allowed,
            long retryAfterSeconds) {
    }
}
