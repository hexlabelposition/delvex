package com.delvex.server.shipment;

public class InvalidShipmentLocationException extends RuntimeException {
    public InvalidShipmentLocationException(String locationId) {
        super("Unknown shipment location: " + locationId);
    }
}
