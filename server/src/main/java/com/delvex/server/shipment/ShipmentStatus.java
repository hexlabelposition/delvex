package com.delvex.server.shipment;

public enum ShipmentStatus {
    CREATED,
    IN_TRANSIT,
    DELIVERED,
    CANCELLED;

    public boolean canTransitionTo(ShipmentStatus target) {
        if (this == target) {
            return true;
        }

        return switch (this) {
            case CREATED -> target == IN_TRANSIT
                    || target == CANCELLED;
            case IN_TRANSIT -> target == DELIVERED
                    || target == CANCELLED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }

    public boolean canBeDeleted() {
        return this == CREATED || this == CANCELLED;
    }
}
