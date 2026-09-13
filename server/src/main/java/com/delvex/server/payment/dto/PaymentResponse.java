package com.delvex.server.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.delvex.server.payment.Payment;
import com.delvex.server.payment.PaymentMethod;
import com.delvex.server.payment.PaymentStatus;

public record PaymentResponse(
        UUID id,
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount,
        String currency,
        Instant paidAt) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getPaidAt());
    }
}
