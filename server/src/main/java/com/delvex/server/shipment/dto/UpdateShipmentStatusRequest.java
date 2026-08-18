package com.delvex.server.shipment.dto;

import com.delvex.server.shipment.ShipmentStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateShipmentStatusRequest(
        @NotNull(message = "Status is required")
        ShipmentStatus status,
        @NotNull(message = "Version is required")
        @PositiveOrZero(message = "Version must not be negative")
        Long version) {
}
