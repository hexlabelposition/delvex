package com.delvex.server.auth.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthRateLimiterTest {

    @Test
    void shouldLimitRequestsUntilTheNextWindow() {
        MutableClock clock = new MutableClock(
                Instant.parse("2026-08-06T10:00:00Z"));
        InMemoryRateLimitStore store = new InMemoryRateLimitStore();
        AuthRateLimiter limiter = new AuthRateLimiter(
                store,
                Duration.ofMinutes(1),
                clock);

        assertTrue(limiter.check("login", "client-1", 2).allowed());
        assertTrue(limiter.check("login", "client-1", 2).allowed());

        AuthRateLimiter.RateLimitDecision denied =
                limiter.check("login", "client-1", 2);

        assertFalse(denied.allowed());
        assertEquals(60, denied.retryAfterSeconds());
        assertEquals(Duration.ofMinutes(1), store.lastTimeToLive);

        clock.advance(Duration.ofMinutes(1));

        assertTrue(limiter.check("login", "client-1", 2).allowed());
    }

    @Test
    void shouldKeepEndpointsAndClientsIndependent() {
        AuthRateLimiter limiter = new AuthRateLimiter(
                new InMemoryRateLimitStore(),
                Duration.ofMinutes(1),
                Clock.fixed(
                        Instant.parse("2026-08-06T10:00:00Z"),
                        ZoneOffset.UTC));

        assertTrue(limiter.check("login", "client-1", 1).allowed());
        assertFalse(limiter.check("login", "client-1", 1).allowed());
        assertTrue(limiter.check("register", "client-1", 1).allowed());
        assertTrue(limiter.check("login", "client-2", 1).allowed());
    }

    @Test
    void shouldShareCountersBetweenLimiterInstances() {
        InMemoryRateLimitStore sharedStore =
                new InMemoryRateLimitStore();
        Clock clock = Clock.fixed(
                Instant.parse("2026-08-06T10:00:00Z"),
                ZoneOffset.UTC);
        AuthRateLimiter firstInstance = new AuthRateLimiter(
                sharedStore,
                Duration.ofMinutes(1),
                clock);
        AuthRateLimiter secondInstance = new AuthRateLimiter(
                sharedStore,
                Duration.ofMinutes(1),
                clock);

        assertTrue(firstInstance
                .check("login", "client-1", 1)
                .allowed());
        assertFalse(secondInstance
                .check("login", "client-1", 1)
                .allowed());
    }

    @Test
    void shouldNotExposeClientAddressInRedisKey() {
        InMemoryRateLimitStore store = new InMemoryRateLimitStore();
        AuthRateLimiter limiter = new AuthRateLimiter(
                store,
                Duration.ofMinutes(1),
                Clock.fixed(
                        Instant.parse("2026-08-06T10:00:00Z"),
                        ZoneOffset.UTC));

        limiter.check("login", "192.0.2.10", 1);

        assertTrue(store.lastKey.startsWith(
                "delvex:rate-limit:auth:login:"));
        assertFalse(store.lastKey.contains("192.0.2.10"));
    }

    private static final class InMemoryRateLimitStore
            implements RateLimitStore {

        private final Map<String, Long> counters = new HashMap<>();
        private String lastKey;
        private Duration lastTimeToLive;

        @Override
        public long increment(
                String key,
                Duration timeToLive) {
            lastKey = key;
            lastTimeToLive = timeToLive;
            return counters.merge(key, 1L, Long::sum);
        }
    }

    private static final class MutableClock extends Clock {

        private Instant instant;

        private MutableClock(Instant instant) {
            this.instant = instant;
        }

        private void advance(Duration duration) {
            instant = instant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }
    }
}
