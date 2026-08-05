package com.delvex.server.auth.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthRateLimiterTest {

    @Test
    void shouldLimitRequestsUntilTheNextWindow() {
        MutableClock clock = new MutableClock(
                Instant.parse("2026-08-06T10:00:00Z"));
        AuthRateLimiter limiter = new AuthRateLimiter(
                Duration.ofMinutes(1),
                clock);

        assertTrue(limiter.check("login", "client-1", 2).allowed());
        assertTrue(limiter.check("login", "client-1", 2).allowed());

        AuthRateLimiter.RateLimitDecision denied =
                limiter.check("login", "client-1", 2);

        assertFalse(denied.allowed());
        assertEquals(60, denied.retryAfterSeconds());

        clock.advance(Duration.ofMinutes(1));

        assertTrue(limiter.check("login", "client-1", 2).allowed());
    }

    @Test
    void shouldKeepEndpointsAndClientsIndependent() {
        AuthRateLimiter limiter = new AuthRateLimiter(
                Duration.ofMinutes(1),
                Clock.fixed(
                        Instant.parse("2026-08-06T10:00:00Z"),
                        ZoneOffset.UTC));

        assertTrue(limiter.check("login", "client-1", 1).allowed());
        assertFalse(limiter.check("login", "client-1", 1).allowed());
        assertTrue(limiter.check("register", "client-1", 1).allowed());
        assertTrue(limiter.check("login", "client-2", 1).allowed());
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
