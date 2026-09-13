package com.delvex.server.payment;

public interface PaymentGateway {
    HostedCheckout createCheckout(Payment payment);

    PaymentWebhookEvent parseWebhook(String payload, String signature);
}
