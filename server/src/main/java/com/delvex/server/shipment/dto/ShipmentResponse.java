package com.delvex.server.shipment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.delvex.server.shipment.Shipment;
import com.delvex.server.shipment.ShipmentStatus;

public record ShipmentResponse(
        UUID id,
        String referenceNumber,
        ShipmentStatus status,
        String originCountry,
        String originCity,
        String originPostalCode,
        String originAddress,
        String destinationCountry,
        String destinationCity,
        String destinationPostalCode,
        String destinationAddress,
        String cargoDescription,
        BigDecimal weightKg,
        Instant pickupAt,
        Instant deliveryAt,
        long version,
        Instant createdAt,
        Instant updatedAt) {

    public static ShipmentResponse from(Shipment shipment) {
        return new ShipmentResponse(
                shipment.getId(),
                shipment.getReferenceNumber(),
                shipment.getStatus(),
                shipment.getOriginCountry(),
                shipment.getOriginCity(),
                shipment.getOriginPostalCode(),
                shipment.getOriginAddress(),
                shipment.getDestinationCountry(),
                shipment.getDestinationCity(),
                shipment.getDestinationPostalCode(),
                shipment.getDestinationAddress(),
                shipment.getCargoDescription(),
                shipment.getWeightKg(),
                shipment.getPickupAt(),
                shipment.getDeliveryAt(),
                shipment.getVersion(),
                shipment.getCreatedAt(),
                shipment.getUpdatedAt());
    }
}
