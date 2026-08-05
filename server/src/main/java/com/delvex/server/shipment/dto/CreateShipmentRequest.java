package com.delvex.server.shipment.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateShipmentRequest(
        @NotBlank(message = "Origin country is required")
        @Pattern(regexp = "[A-Za-z]{2}", message = "Origin country must be a two-letter code")
        String originCountry,

        @NotBlank(message = "Origin city is required")
        @Size(max = 100, message = "Origin city must contain at most 100 characters")
        String originCity,

        @NotBlank(message = "Origin postal code is required")
        @Size(max = 20, message = "Origin postal code must contain at most 20 characters")
        String originPostalCode,

        @NotBlank(message = "Origin address is required")
        @Size(max = 255, message = "Origin address must contain at most 255 characters")
        String originAddress,

        @NotBlank(message = "Destination country is required")
        @Pattern(regexp = "[A-Za-z]{2}", message = "Destination country must be a two-letter code")
        String destinationCountry,

        @NotBlank(message = "Destination city is required")
        @Size(max = 100, message = "Destination city must contain at most 100 characters")
        String destinationCity,

        @NotBlank(message = "Destination postal code is required")
        @Size(max = 20, message = "Destination postal code must contain at most 20 characters")
        String destinationPostalCode,

        @NotBlank(message = "Destination address is required")
        @Size(max = 255, message = "Destination address must contain at most 255 characters")
        String destinationAddress,

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
        return pickupAt == null
                || deliveryAt == null
                || !deliveryAt.isBefore(pickupAt);
    }
}
