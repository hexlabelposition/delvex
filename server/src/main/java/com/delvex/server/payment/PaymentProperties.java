package com.delvex.server.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties(prefix = "payment")
public record PaymentProperties(
        @NotBlank String stripeSecretKey,
        @NotBlank String stripeWebhookSecret,
        @NotBlank String clientUrl) {
}
