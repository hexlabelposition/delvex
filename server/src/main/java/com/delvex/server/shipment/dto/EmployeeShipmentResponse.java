package com.delvex.server.shipment.dto;

import java.util.UUID;

import com.delvex.server.shipment.Shipment;

public record EmployeeShipmentResponse(
        ShipmentResponse shipment,
        CustomerSummary customer) {

    public static EmployeeShipmentResponse from(Shipment shipment) {
        return new EmployeeShipmentResponse(
                ShipmentResponse.from(shipment),
                new CustomerSummary(
                        shipment.getUser().getId(),
                        shipment.getUser().getEmail(),
                        shipment.getUser().getFirstName(),
                        shipment.getUser().getLastName()));
    }

    public record CustomerSummary(
            UUID id,
            String email,
            String firstName,
            String lastName) {
    }
}
