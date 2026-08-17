package com.delvex.server.shipment.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = false)
public record UpdateShipmentRequest(
        @Size(max = 30, message = "Origin location id must contain at most 30 characters")
        String originLocationId,
        @Size(max = 30, message = "Destination location id must contain at most 30 characters")
        String destinationLocationId,
        @Size(max = 500, message = "Cargo description must contain at most 500 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Cargo description must not be blank")
        String cargoDescription,
        @DecimalMin(value = "0.01", message = "Weight must be at least 0.01 kg")
        @Digits(integer = 8, fraction = 2, message = "Weight must contain at most 8 integer and 2 decimal digits")
        BigDecimal weightKg,
        Instant pickupAt,
        Instant deliveryAt) {

    @JsonIgnore
    @AssertTrue(message = "At least one shipment field must be provided")
    public boolean isUpdateProvided() {
        return originLocationId != null || destinationLocationId != null
                || cargoDescription != null || weightKg != null || pickupAt != null || deliveryAt != null;
    }

    @JsonIgnore
    @AssertTrue(message = "Delivery time must not be before pickup time")
    public boolean isScheduleValid() {
        return pickupAt == null || deliveryAt == null || !deliveryAt.isBefore(pickupAt);
    }
}
