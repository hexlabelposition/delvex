package com.delvex.server.payment;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ShipmentPriceCalculatorTest {

    private final ShipmentPriceCalculator calculator =
            new ShipmentPriceCalculator();

    @Test
    void shouldPriceSupportedWeightBands() {
        assertThat(calculator.calculate(new BigDecimal("10")))
                .isEqualByComparingTo("29.00");
        assertThat(calculator.calculate(new BigDecimal("20")))
                .isEqualByComparingTo("49.00");
        assertThat(calculator.calculate(new BigDecimal("50")))
                .isEqualByComparingTo("79.00");
    }

    @Test
    void shouldRejectUnsupportedWeight() {
        assertThatThrownBy(() -> calculator.calculate(new BigDecimal("50.01")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
