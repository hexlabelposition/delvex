package com.delvex.server.shipment;

public class InvalidShipmentStateException extends RuntimeException {

    public InvalidShipmentStateException(String message) {
        super(message);
    }
}
