package com.delvex.server.shipment.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.delvex.server.shipment.ShipmentStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateShipmentRequest(
        ShipmentStatus status,

        @Pattern(regexp = "[A-Za-z]{2}", message = "Origin country must be a two-letter code")
        String originCountry,

        @Size(max = 100, message = "Origin city must contain at most 100 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Origin city must not be blank")
        String originCity,

        @Size(max = 20, message = "Origin postal code must contain at most 20 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Origin postal code must not be blank")
        String originPostalCode,

        @Size(max = 255, message = "Origin address must contain at most 255 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Origin address must not be blank")
        String originAddress,

        @Pattern(regexp = "[A-Za-z]{2}", message = "Destination country must be a two-letter code")
        String destinationCountry,

        @Size(max = 100, message = "Destination city must contain at most 100 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Destination city must not be blank")
        String destinationCity,

        @Size(max = 20, message = "Destination postal code must contain at most 20 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Destination postal code must not be blank")
        String destinationPostalCode,

        @Size(max = 255, message = "Destination address must contain at most 255 characters")
        @Pattern(regexp = "(?s).*\\S.*", message = "Destination address must not be blank")
        String destinationAddress,

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
        return status != null
                || originCountry != null
                || originCity != null
                || originPostalCode != null
                || originAddress != null
                || destinationCountry != null
                || destinationCity != null
                || destinationPostalCode != null
                || destinationAddress != null
                || cargoDescription != null
                || weightKg != null
                || pickupAt != null
                || deliveryAt != null;
    }

    @JsonIgnore
    @AssertTrue(message = "Delivery time must not be before pickup time")
    public boolean isScheduleValid() {
        return pickupAt == null
                || deliveryAt == null
                || !deliveryAt.isBefore(pickupAt);
    }
}
