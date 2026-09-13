package com.delvex.server.payment;

public class InvalidWebhookSignatureException extends RuntimeException {
    public InvalidWebhookSignatureException() {
        super("Invalid Stripe webhook signature");
    }
}
