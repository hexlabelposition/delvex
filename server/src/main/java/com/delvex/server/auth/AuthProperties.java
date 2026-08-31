package com.delvex.server.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Validated
@ConfigurationProperties(prefix = "auth")
public record AuthProperties(
        @NotBlank
        String issuer,
        @NotBlank
        String accessTokenSecret,
        @NotNull
        Duration accessTokenTtl,
        @NotNull
        Duration refreshTokenTtl,
        boolean refreshCookieSecure,
        @NotNull
        Duration refreshSessionCleanupInterval,
        @NotNull
        Duration refreshSessionCleanupInitialDelay) {
}
