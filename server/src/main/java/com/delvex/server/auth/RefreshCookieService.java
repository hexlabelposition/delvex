package com.delvex.server.auth;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class RefreshCookieService {

    public static final String COOKIE_NAME = "refresh_token";
    private static final String COOKIE_PATH = "/api/auth";
    private static final String SAME_SITE = "Lax";

    private final Duration refreshTokenTtl;
    private final boolean secure;

    public RefreshCookieService(AuthProperties properties) {
        this.refreshTokenTtl = properties.refreshTokenTtl();
        this.secure = properties.refreshCookieSecure();
    }

    public String create(String refreshToken) {
        return cookie(refreshToken)
                .maxAge(refreshTokenTtl)
                .build()
                .toString();
    }

    public String clear() {
        return cookie("")
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }

    private ResponseCookie.ResponseCookieBuilder cookie(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(SAME_SITE)
                .path(COOKIE_PATH);
    }

}
