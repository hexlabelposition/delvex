package com.delvex.server.shipment;

public class StaleShipmentVersionException extends RuntimeException {

    public StaleShipmentVersionException() {
        super("Shipment was changed by another request; reload it and try again");
    }
}
