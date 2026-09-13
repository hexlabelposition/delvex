package com.delvex.server.payment;

public record PaymentWebhookEvent(
        String type,
        String sessionId,
        String paymentStatus,
        String paymentIntentId) {
}
