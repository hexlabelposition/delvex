package com.delvex.server.auth.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

public class AuthRateLimiter {

    private static final long CLEANUP_INTERVAL = 1024;

    private final long windowMillis;
    private final Clock clock;
    private final ConcurrentMap<ClientKey, ClientWindow> windows =
            new ConcurrentHashMap<>();
    private final AtomicLong requestCount = new AtomicLong();

    public AuthRateLimiter(Duration window) {
        this(window, Clock.systemUTC());
    }

    AuthRateLimiter(Duration window, Clock clock) {
        this.windowMillis = window.toMillis();
        this.clock = clock;
    }

    public RateLimitDecision check(
            String endpoint,
            String clientId,
            int maxRequests) {
        long now = clock.millis();
        long windowStart = now - Math.floorMod(now, windowMillis);
        ClientKey key = new ClientKey(endpoint, clientId);
        AtomicBoolean allowed = new AtomicBoolean();

        windows.compute(key, (ignored, current) -> {
            if (current == null
                    || current.windowStartMillis() != windowStart) {
                allowed.set(true);
                return new ClientWindow(windowStart, 1);
            }

            if (current.requests() < maxRequests) {
                allowed.set(true);
                return new ClientWindow(
                        windowStart,
                        current.requests() + 1);
            }

            return current;
        });

        cleanupExpiredWindows(windowStart);

        long retryAfterMillis = windowStart
                + windowMillis
                - now;
        long retryAfterSeconds = Math.max(
                1,
                (retryAfterMillis + 999) / 1000);

        return new RateLimitDecision(
                allowed.get(),
                retryAfterSeconds);
    }

    private void cleanupExpiredWindows(long currentWindowStart) {
        if (requestCount.incrementAndGet() % CLEANUP_INTERVAL != 0) {
            return;
        }

        windows.entrySet().removeIf(entry ->
                entry.getValue().windowStartMillis()
                        < currentWindowStart);
    }

    private record ClientKey(
            String endpoint,
            String clientId) {
    }

    private record ClientWindow(
            long windowStartMillis,
            int requests) {
    }

    public record RateLimitDecision(
            boolean allowed,
            long retryAfterSeconds) {
    }
}
