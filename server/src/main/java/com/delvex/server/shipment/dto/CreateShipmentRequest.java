package com.delvex.server.shipment.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateShipmentRequest(
        @NotBlank(message = "Origin location is required") String originLocationId,
        @NotBlank(message = "Destination location is required") String destinationLocationId,
        @NotBlank(message = "Cargo description is required")
        @Size(max = 500, message = "Cargo description must contain at most 500 characters")
        String cargoDescription,
        @NotNull(message = "Weight is required")
        @DecimalMin(value = "0.01", message = "Weight must be at least 0.01 kg")
        @Digits(integer = 8, fraction = 2, message = "Weight must contain at most 8 integer and 2 decimal digits")
        BigDecimal weightKg,
        Instant pickupAt,
        Instant deliveryAt) {

    @JsonIgnore
    @AssertTrue(message = "Delivery time must not be before pickup time")
    public boolean isScheduleValid() {
        return pickupAt == null || deliveryAt == null || !deliveryAt.isBefore(pickupAt);
    }
}
