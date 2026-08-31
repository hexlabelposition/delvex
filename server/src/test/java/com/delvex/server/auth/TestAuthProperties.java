package com.delvex.server.auth;

import java.time.Duration;
import java.util.Base64;

final class TestAuthProperties {

    private TestAuthProperties() {
    }

    static AuthProperties authProperties() {
        return authProperties(Duration.ofDays(30), true);
    }

    static AuthProperties authProperties(
            Duration refreshTokenTtl,
            boolean refreshCookieSecure) {
        return new AuthProperties(
                "delvex",
                Base64.getEncoder().encodeToString(new byte[32]),
                Duration.ofMinutes(15),
                refreshTokenTtl,
                refreshCookieSecure,
                Duration.ofHours(1),
                Duration.ofHours(1));
    }
}
