package com.delvex.server.payment;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

@Component
public class ShipmentPriceCalculator {

    public BigDecimal calculate(BigDecimal weightKg) {
        if (weightKg.compareTo(BigDecimal.TEN) <= 0) {
            return new BigDecimal("29.00");
        }
        if (weightKg.compareTo(new BigDecimal("20")) <= 0) {
            return new BigDecimal("49.00");
        }
        if (weightKg.compareTo(new BigDecimal("50")) <= 0) {
            return new BigDecimal("79.00");
        }
        throw new IllegalArgumentException("Weight must not exceed 50 kg");
    }
}
