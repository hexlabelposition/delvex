package com.delvex.server.auth;

import java.time.Duration;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RefreshCookieServiceTest {

    @Test
    void shouldCreateSecureHttpOnlyRefreshCookie() {
        RefreshCookieService refreshCookieService = new RefreshCookieService(
                Duration.ofDays(30),
                true);

        String cookie = refreshCookieService.create("refresh-token");

        assertThat(cookie)
                .contains("refresh_token=refresh-token")
                .contains("Path=/api/auth")
                .contains("Max-Age=2592000")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Lax");
    }

    @Test
    void shouldClearRefreshCookie() {
        RefreshCookieService refreshCookieService = new RefreshCookieService(
                Duration.ofDays(30),
                true);

        String cookie = refreshCookieService.clear();

        assertThat(cookie)
                .contains("refresh_token=")
                .contains("Path=/api/auth")
                .contains("Max-Age=0")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Lax");
    }
}
