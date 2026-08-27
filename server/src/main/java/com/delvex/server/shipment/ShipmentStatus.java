package com.delvex.server.shipment;

public enum ShipmentStatus {
    CREATED,
    ACCEPTED_AT_ORIGIN,
    IN_TRANSIT,
    ARRIVED_AT_DESTINATION,
    DELIVERED,
    CANCELLED;

    public boolean canBeDeleted() {
        return this == CREATED;
    }
}
