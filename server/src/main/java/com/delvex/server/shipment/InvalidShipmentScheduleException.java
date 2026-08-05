package com.delvex.server.shipment;

public class InvalidShipmentScheduleException extends RuntimeException {

    public InvalidShipmentScheduleException() {
        super("Delivery time must not be before pickup time");
    }
}
