package com.delvex.server.shipment;

public enum ShipmentStatus {
    CREATED,
    ACCEPTED_AT_ORIGIN,
    IN_TRANSIT,
    ARRIVED_AT_DESTINATION,
    DELIVERED,
    CANCELLED;

    public boolean canTransitionTo(ShipmentStatus target) {
        if (this == target) {
            return true;
        }

        return switch (this) {
            case CREATED -> target == ACCEPTED_AT_ORIGIN
                    || target == CANCELLED;
            case ACCEPTED_AT_ORIGIN -> target == IN_TRANSIT
                    || target == CANCELLED;
            case IN_TRANSIT -> target == ARRIVED_AT_DESTINATION;
            case ARRIVED_AT_DESTINATION -> target == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }

    public boolean canBeDeleted() {
        return this == CREATED;
    }
}
