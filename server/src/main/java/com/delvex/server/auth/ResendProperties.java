package com.delvex.server.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties(prefix = "resend")
public record ResendProperties(
        @NotBlank
        String apiKey) {
}
