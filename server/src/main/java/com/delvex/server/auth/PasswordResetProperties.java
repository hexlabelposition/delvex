package com.delvex.server.auth;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.AssertTrue;

@Validated
@ConfigurationProperties(prefix = "password-reset")
public record PasswordResetProperties(
        @NotNull
        URI clientUrl,
        @NotNull
        Duration tokenTtl,
        @NotBlank
        String mailFrom,
        @NotNull
        Duration cleanupInterval,
        @NotNull
        Duration cleanupInitialDelay) {

    @AssertTrue(message = "Password reset durations must be positive")
    public boolean areDurationsPositive() {
        return isPositive(tokenTtl)
                && isPositive(cleanupInterval)
                && isPositive(cleanupInitialDelay);
    }

    private static boolean isPositive(Duration duration) {
        return duration != null
                && !duration.isZero()
                && !duration.isNegative();
    }
}
