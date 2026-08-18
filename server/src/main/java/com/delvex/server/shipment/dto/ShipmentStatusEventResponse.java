package com.delvex.server.shipment.dto;

import java.time.Instant;
import java.util.UUID;

import com.delvex.server.shipment.ShipmentStatus;
import com.delvex.server.shipment.ShipmentStatusEvent;
import com.delvex.server.user.UserRole;

public record ShipmentStatusEventResponse(
        UUID id,
        ShipmentStatus previousStatus,
        ShipmentStatus newStatus,
        UUID changedByUserId,
        String changedByFirstName,
        String changedByLastName,
        UserRole changedByRole,
        Instant changedAt) {

    public static ShipmentStatusEventResponse from(
            ShipmentStatusEvent event) {
        return new ShipmentStatusEventResponse(
                event.getId(),
                event.getPreviousStatus(),
                event.getNewStatus(),
                event.getChangedBy().getId(),
                event.getChangedBy().getFirstName(),
                event.getChangedBy().getLastName(),
                event.getChangedBy().getRole(),
                event.getChangedAt());
    }
}
