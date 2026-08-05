package com.delvex.server.shipment;

public class ShipmentNotFoundException extends RuntimeException {

    public ShipmentNotFoundException() {
        super("Shipment not found");
    }
}
